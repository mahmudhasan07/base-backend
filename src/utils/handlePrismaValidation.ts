export const handlePrismaValidation = (errorMessage: string) => {
  const missingFieldsRegex = /Argument `(.+?)` is missing\./g;
  let match;
  const missingFields: string[] = [];
  const details: { type: string; field: string; message: string }[] = [];

  while ((match = missingFieldsRegex.exec(errorMessage)) !== null) {
    const field = match[1];
    missingFields.push(field);
    details.push({
      type: "MissingField",
      field,
      message: `Argument \`${field}\` is missing.`,
    });
  }

  const invalidValueRegex =
    /Argument `(.+?)`: Invalid value provided. Expected (.+), provided (.+)\./g;
  const invalidValues: string[] = [];

  while ((match = invalidValueRegex.exec(errorMessage)) !== null) {
    const field = match[1];
    const expectedType = match[2];
    const providedValue = match[3];
    invalidValues.push(`${field}: Expected ${expectedType}, provided ${providedValue}`);
    details.push({
      type: "InvalidValue",
      field,
      message: `${field}: Expected ${expectedType}, provided ${providedValue}`,
    });
  }

  const missingFieldsMessage = missingFields.length
    ? `Missing fields: ${missingFields.join(", ")}`
    : "";
  const invalidValuesMessage = invalidValues.length
    ? `Invalid values: ${invalidValues.join("; ")}`
    : "";

  const message = `${missingFieldsMessage}${
    missingFieldsMessage && invalidValuesMessage ? "; " : ""
  }${invalidValuesMessage}`;

  return {
    message,
    details,
  };
};
