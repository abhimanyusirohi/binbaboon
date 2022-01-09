import { FieldDefinition } from "./FieldDefinition";

describe("FieldDefinition", () => {
  test("set and get value descriptions", () => {
    const definition = new FieldDefinition("Test Field", 4);

    const buffer = new ArrayBuffer(10);
    expect(definition.getDescriptionForValue(buffer)).toBeUndefined();

    definition.setDescriptionForValue(buffer, "Some description");

    // Use a different buffer for the value to make sure we aren't keeping a ref
    const valueBuffer = new ArrayBuffer(10);
    expect(definition.getDescriptionForValue(valueBuffer)).toBe(
      "Some description"
    );
  });
});
