// Requests of new terms for the glossary. The addresses are those of linkeddata/model/v1/settings.yaml.
export const GLOSSARY = "https://YOUR-ORG.github.io/virtual-x-platform-config/glossary#";
// The tables of the terms in the glossary repository (templates/<table>.tsv). Chemicals are left out, as they have
// Wikibase items in place of glossary addresses.
const TABLES = ["general", "process_flow", "tools"];
const FORM = "https://github.com/YOUR-ORG/virtual-x-platform-config/issues/new";

// Return a choice of the table for a new term.
export function tableChoice() {
  const select = document.createElement("select");
  select.className = "form-select form-select-sm";
  for (const table of TABLES) {
    select.append(new Option(table.replace("_", " "), table));
  }
  return select;
}

// Return the address of the term request form, filled in with a term and its table.
export function requestAddress(term, table) {
  const context = ["Table: templates/" + table + ".tsv"];
  if (term.references && term.references.length) {
    context.push("References: " + term.references.join(", "));
  }
  if (term.address) {
    context.push("Draft term on the platform: " + term.address);
  }
  const fields = {
    template: "ontology-term-request.yml",
    title: "[TERM REQUEST] " + term.name,
    label: term.name,
    definition: term.definition || "",
    acronym: term.abbreviation || "",
    context: context.join("\n"),
  };
  return FORM + "?" + new URLSearchParams(fields).toString();
}

// Open the request form in a new tab.
export function openRequest(term, table) {
  window.open(requestAddress(term, table), "_blank", "noopener");
}
