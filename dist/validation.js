(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.RuleRailValidation = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const FORBIDDEN_XML = /<!DOCTYPE|<!ENTITY/i;

  function finding(code, severity, path, message, correction, source) {
    return { code, severity, path, message, correction, source };
  }

  function simpleWellFormed(xml) {
    const stripped = String(xml)
      .replace(/<\?xml[\s\S]*?\?>/gi, "")
      .replace(/<!--([\s\S]*?)-->/g, "")
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "");
    const tags = stripped.match(/<[^>]+>/g) || [];
    const stack = [];
    for (const raw of tags) {
      if (/^<\//.test(raw)) {
        const name = raw.match(/^<\/\s*([^\s>]+)/);
        if (!name || stack.pop() !== name[1]) return false;
      } else if (!/^<!/.test(raw) && !/^<\?/.test(raw) && !/\/\s*>$/.test(raw)) {
        const name = raw.match(/^<\s*([^\s/>]+)/);
        if (name) stack.push(name[1]);
      }
    }
    return stack.length === 0 && /<[^>]+>/.test(stripped);
  }

  function localTagPresent(fragment, localName) {
    const expression = new RegExp("<(?:[A-Za-z_][\\w.-]*:)?" + localName + "(?:\\s[^>]*)?>[\\s\\S]*?<\\/(?:[A-Za-z_][\\w.-]*:)?" + localName + "\\s*>", "i");
    return expression.test(fragment);
  }

  function localTagCount(fragment, localName) {
    const expression = new RegExp("<(?:[A-Za-z_][\\w.-]*:)?" + localName + "(?:\\s[^>]*)?>", "gi");
    return (fragment.match(expression) || []).length;
  }

  function addressFragmentsWithRegex(xml) {
    const expression = /<(?:[A-Za-z_][\w.-]*:)?PstlAdr(?:\s[^>]*)?>([\s\S]*?)<\/(?:[A-Za-z_][\w.-]*:)?PstlAdr\s*>/gi;
    const fragments = [];
    let match;
    while ((match = expression.exec(xml)) !== null) fragments.push(match[1]);
    return fragments;
  }

  function addressFactsWithDom(xml) {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(xml, "application/xml");
    if (documentNode.getElementsByTagName("parsererror").length) return { malformed: true, addresses: [] };
    const nodes = Array.from(documentNode.getElementsByTagNameNS("*", "PstlAdr"));
    const addresses = nodes.map((node) => {
      const children = Array.from(node.children || []);
      const names = children.map((child) => child.localName);
      return {
        hasTown: names.includes("TwnNm"),
        hasCountry: names.includes("Ctry"),
        addressLines: names.filter((name) => name === "AdrLine").length,
        structuredCount: names.filter((name) => name !== "AdrLine").length
      };
    });
    return { malformed: false, addresses };
  }

  function addressFacts(xml) {
    if (typeof DOMParser !== "undefined") return addressFactsWithDom(xml);
    if (!simpleWellFormed(xml)) return { malformed: true, addresses: [] };
    return {
      malformed: false,
      addresses: addressFragmentsWithRegex(xml).map((fragment) => ({
        hasTown: localTagPresent(fragment, "TwnNm"),
        hasCountry: localTagPresent(fragment, "Ctry"),
        addressLines: localTagCount(fragment, "AdrLine"),
        structuredCount: ["StrtNm", "BldgNb", "BldgNm", "PstCd", "TwnNm", "CtrySubDvsn", "Ctry"]
          .reduce((count, tag) => count + localTagCount(fragment, tag), 0)
      }))
    };
  }

  function validatePaymentXml(input, options) {
    const xml = String(input || "").trim();
    const profile = Object.assign({ name: "Northstar Bank", allowAddressLines: true, maxAddressLines: 2 }, options || {});
    const findings = [];

    if (!xml) {
      findings.push(finding(
        "RR-XML-EMPTY",
        "error",
        "/",
        "No XML message was supplied.",
        "Paste a supported ISO 20022 message or load a sample.",
        "RuleRail input safety"
      ));
      return summarize(findings, 0);
    }

    if (FORBIDDEN_XML.test(xml)) {
      findings.push(finding(
        "RR-XML-UNSAFE",
        "error",
        "/",
        "Document type and entity declarations are not accepted.",
        "Remove DTD or entity declarations and provide a self-contained XML message.",
        "RuleRail secure parsing policy"
      ));
      return summarize(findings, 0);
    }

    const facts = addressFacts(xml);
    if (facts.malformed) {
      findings.push(finding(
        "RR-XML-PARSE",
        "error",
        "/",
        "The XML is not well formed.",
        "Correct unmatched or invalid XML elements, then run the check again.",
        "ISO 20022 message syntax"
      ));
      return summarize(findings, 0);
    }

    if (!facts.addresses.length) {
      findings.push(finding(
        "RR-ADDR-NOT-FOUND",
        "warning",
        "//*[local-name()='PstlAdr']",
        "No postal-address block was found in this sample.",
        "Confirm that the selected payment scenario does not require party postal addresses.",
        "Northstar demo profile"
      ));
    }

    facts.addresses.forEach((address, index) => {
      const basePath = "//*[local-name()='PstlAdr'][" + (index + 1) + "]";
      if (address.addressLines > 0 && !profile.allowAddressLines) {
        findings.push(finding(
          "RR-BANK-ADRLINE-PROHIBITED",
          "error",
          basePath + "/*[local-name()='AdrLine']",
          profile.name + " does not permit address lines for this delivery profile.",
          "Map the address to structured postal-address elements.",
          profile.name + " demo delivery profile"
        ));
      }
      if (address.addressLines > 0 && !address.hasTown) {
        findings.push(finding(
          "RR-EPC-HYBRID-TOWN",
          "error",
          basePath + "/*[local-name()='TwnNm']",
          "Town name is missing from a hybrid postal address.",
          "Provide TwnNm alongside any retained AdrLine elements.",
          "EPC Guidance: provision of addresses"
        ));
      }
      if (address.addressLines > 0 && !address.hasCountry) {
        findings.push(finding(
          "RR-EPC-HYBRID-COUNTRY",
          "error",
          basePath + "/*[local-name()='Ctry']",
          "Country code is missing from a hybrid postal address.",
          "Provide a valid two-letter country code in Ctry.",
          "EPC Guidance: provision of addresses"
        ));
      }
      if (address.addressLines > profile.maxAddressLines) {
        findings.push(finding(
          "RR-BANK-ADRLINE-LIMIT",
          "warning",
          basePath + "/*[local-name()='AdrLine']",
          "The address contains " + address.addressLines + " lines; the selected profile supports " + profile.maxAddressLines + ".",
          "Reduce the number of address lines or move values into structured elements.",
          profile.name + " demo delivery profile"
        ));
      }
      if (address.addressLines > 0 && address.hasTown && address.hasCountry && profile.allowAddressLines) {
        findings.push(finding(
          "RR-EPC-HYBRID-ACCEPTED",
          "info",
          basePath,
          "Minimum hybrid-address elements are present.",
          "No correction is required for this illustrative check.",
          "EPC Guidance: provision of addresses"
        ));
      }
      if (address.addressLines === 0 && address.structuredCount > 0 && address.hasTown && address.hasCountry) {
        findings.push(finding(
          "RR-EPC-STRUCTURED-ACCEPTED",
          "info",
          basePath,
          "A structured postal address with town and country was detected.",
          "No correction is required for this illustrative check.",
          "EPC Guidance: provision of addresses"
        ));
      }
    });

    const errors = findings.filter((item) => item.severity === "error").length;
    const warnings = findings.filter((item) => item.severity === "warning").length;
    const score = Math.max(0, 100 - errors * 35 - warnings * 12);
    return summarize(findings, score);
  }

  function summarize(findings, score) {
    const errors = findings.filter((item) => item.severity === "error").length;
    const warnings = findings.filter((item) => item.severity === "warning").length;
    const info = findings.filter((item) => item.severity === "info").length;
    return {
      passed: errors === 0,
      score,
      counts: { errors, warnings, info },
      findings
    };
  }

  return { validatePaymentXml, simpleWellFormed };
});
