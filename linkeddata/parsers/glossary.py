"""Parser of the glossary of the platform."""

from rdflib import RDF, RDFS, Graph
from rdflib.namespace import DC, OWL, SKOS

from linkeddata.parsers import GLOSSARY, link, present
from linkeddata.profile import settings

NAMESPACE = GLOSSARY
VOCABULARY = "vocabularies/glossary"


def parse(content: bytes) -> list[dict]:
    graph = Graph().parse(data=content, format="turtle")
    rows = [{"@id": VOCABULARY, "@type": "DefinedTermSet", "name": settings()["glossary"]["name"], "void:uriSpace": NAMESPACE,
             "url": link(settings()["glossary"]["site"])}]
    for term in sorted(graph.subjects(RDF.type, OWL.Class)):
        if not str(term).startswith(NAMESPACE):
            continue
        row = {"@id": str(term), "@type": "DefinedTerm", "termCode": str(term).removeprefix(NAMESPACE), "inDefinedTermSet": link(VOCABULARY)}
        label = graph.value(term, RDFS.label)
        if present(label):
            row["name"] = str(label)
        definition = graph.value(term, DC.description)
        if present(definition):
            row["description"] = str(definition)
        # A short label, such as Exposure for Exposure (Process Flow Step), is another name of the term.
        alternates = []
        for alternate in sorted(graph.objects(term, SKOS.altLabel)):
            if present(alternate):
                alternates.append(str(alternate))
        if alternates:
            row["alternateName"] = alternates
        rows.append(row)
    return rows
