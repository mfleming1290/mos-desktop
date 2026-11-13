// Build-only transform for the checksum-verified SDK 0.1.0 input.
// Never writes generated SDK files or changes retained serializer definitions.
import assert from 'node:assert/strict';
export function pruneFixture(source) {
  const declaration = source.indexOf('// -----------------------------------------------------------------------------\n// struct FixtureEnvelope');
  const serializers = source.indexOf('// -----------------------------------------------------------------------------\n// Initialize the serializers', declaration);
  const descriptor = source.indexOf('    {\n      kind: "struct",\n      ctor: FixtureEnvelope,');
  const tail = source.indexOf('  ]\n);', descriptor);
  assert(declaration > 0 && serializers > declaration && descriptor > serializers && tail > descriptor,
    'SDK layout changed: review fixture pruning');
  const removed = source.slice(descriptor, tail);
  assert.equal((removed.match(/\bctor: FixtureEnvelope/g) ?? []).length, 1);
  assert(removed.trimEnd().endsWith('},'));
  assert(!/\bname: "(?!FixtureEnvelope)[A-Z]/.test(removed), 'Refuse to remove another DTO');
  const output = source.slice(0,declaration) + source.slice(serializers,descriptor) + source.slice(tail);
  assert(!output.includes('FixtureEnvelope'), 'Unexpected remaining fixture reference');
  return output;
}
