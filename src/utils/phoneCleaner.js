import { CODES_BY_LENGTH_DESC } from "./countryCodes.js";

const MIN_LOCAL_DIGITS = 6; // don't strip a code if it leaves an implausibly short number

/**
 * Clean a single raw phone number line.
 *
 * @param {string} rawLine
 * @param {object} options
 * @param {"auto"|"search"|"custom"|"none"} options.mode
 * @param {string} options.selectedCode - digits-only code, used when mode === "search"
 * @param {string} options.customCode - digits-only code, used when mode === "custom"
 * @param {boolean} options.stripTrunkZero - also drop a leading local trunk "0"
 * @returns {{ input: string, output: string, note: string, status: "removed"|"unchanged"|"empty" } | null}
 */
export function cleanPhoneNumber(rawLine, options) {
  const { mode, selectedCode, customCode, stripTrunkZero } = options;
  const input = rawLine.trim();
  if (!input) return null;

  const hadPlus = input.trimStart().startsWith("+");

  // Strip everything except digits: handles +, -, spaces, (), dots, etc.
  let digits = input.replace(/\D/g, "");

  if (!digits) {
    return { input, output: "", note: "no digits found", status: "empty" };
  }

  // A leading "00" is the common alternative to "+" for dialing internationally.
  let hadIntlPrefix = hadPlus;
  if (!hadPlus && digits.startsWith("00") && digits.length > 9) {
    digits = digits.slice(2);
    hadIntlPrefix = true;
  }

  let output = digits;
  let note = "cleaned only";
  let status = "unchanged";

  const tryStripCode = (code) => {
    if (code && digits.startsWith(code) && digits.length - code.length >= MIN_LOCAL_DIGITS) {
      return digits.slice(code.length);
    }
    return null;
  };

  if (mode === "search") {
    const stripped = tryStripCode(selectedCode);
    if (stripped !== null) {
      output = stripped;
      note = `removed +${selectedCode}`;
      status = "removed";
    } else {
      note = "selected code not found, left as-is";
    }
  } else if (mode === "custom") {
    const stripped = tryStripCode(customCode);
    if (stripped !== null) {
      output = stripped;
      note = `removed custom code +${customCode}`;
      status = "removed";
    } else {
      note = customCode ? "custom code not found, left as-is" : "no custom code entered";
    }
  } else if (mode === "auto") {
    // Strong signal: explicit "+" or "00" international prefix — always try.
    // Weak signal: no prefix, but the number is longer than a typical
    // national number (11+ digits), so it likely still carries a country code.
    const shouldAttempt = hadIntlPrefix || digits.length >= 11;
    if (shouldAttempt) {
      const match = CODES_BY_LENGTH_DESC.find(
        (c) => digits.startsWith(c.code) && digits.length - c.code.length >= MIN_LOCAL_DIGITS
      );
      if (match) {
        output = digits.slice(match.code.length);
        note = `auto-detected +${match.code} (${match.name})`;
        status = "removed";
      } else {
        note = "no known code matched";
      }
    } else {
      note = "local format, no code to strip";
    }
  }
  // mode === "none" falls through: digits stay as-is, only formatting was cleaned.

  if (stripTrunkZero && output.startsWith("0") && output.length > 8) {
    output = output.slice(1);
    note += ", trunk 0 dropped";
  }

  return { input, output, note, status };
}

export function cleanBatch(text, options) {
  const lines = text.split(/\r?\n/);
  const results = [];
  for (const line of lines) {
    const result = cleanPhoneNumber(line, options);
    if (result) results.push(result);
  }
  return results;
}
