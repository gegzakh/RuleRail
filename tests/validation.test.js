const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePaymentXml, simpleWellFormed } = require("../dist/validation.js");

const wrap = (address) => `<?xml version="1.0"?><Document><PmtInf><Dbtr><PstlAdr>${address}</PstlAdr></Dbtr></PmtInf></Document>`;

test("accepts a minimum hybrid postal address", () => {
  const result = validatePaymentXml(wrap("<TwnNm>Berlin</TwnNm><Ctry>DE</Ctry><AdrLine>Am Industriepark 18</AdrLine>"));
  assert.equal(result.passed, true);
  assert.equal(result.counts.errors, 0);
  assert.ok(result.findings.some((item) => item.code === "RR-EPC-HYBRID-ACCEPTED"));
});

test("reports town and country for an unstructured-only address", () => {
  const result = validatePaymentXml(wrap("<AdrLine>Am Industriepark 18, Berlin, Germany</AdrLine>"));
  assert.equal(result.passed, false);
  assert.deepEqual(result.findings.filter((item) => item.severity === "error").map((item) => item.code), ["RR-EPC-HYBRID-TOWN", "RR-EPC-HYBRID-COUNTRY"]);
});

test("accepts a fully structured address", () => {
  const result = validatePaymentXml(wrap("<StrtNm>Main Street</StrtNm><BldgNb>7</BldgNb><PstCd>10115</PstCd><TwnNm>Berlin</TwnNm><Ctry>DE</Ctry>"));
  assert.equal(result.passed, true);
  assert.ok(result.findings.some((item) => item.code === "RR-EPC-STRUCTURED-ACCEPTED"));
});

test("rejects malformed or unsafe XML", () => {
  assert.equal(simpleWellFormed("<Document><PmtInf></Document>"), false);
  assert.equal(validatePaymentXml("<Document><PmtInf></Document>").findings[0].code, "RR-XML-PARSE");
  assert.equal(validatePaymentXml("<!DOCTYPE x [<!ENTITY e SYSTEM 'file:///tmp/x'>]><x>&e;</x>").findings[0].code, "RR-XML-UNSAFE");
});

test("enforces a stricter profile overlay deterministically", () => {
  const xml = wrap("<TwnNm>Berlin</TwnNm><Ctry>DE</Ctry><AdrLine>Main Street 7</AdrLine>");
  const first = validatePaymentXml(xml, { name: "Alpine Bank", allowAddressLines: false });
  const second = validatePaymentXml(xml, { name: "Alpine Bank", allowAddressLines: false });
  assert.deepEqual(first, second);
  assert.ok(first.findings.some((item) => item.code === "RR-BANK-ADRLINE-PROHIBITED"));
});
