# Virtual X Platform

Template for the central web application of a Virtual X Platform: a website that gives access to the tools, methods,
data, and use cases of a project, around a shared glossary. It is derived from the `pseudo` branch of the
[VHP4Safety Virtual Human Platform](https://github.com/VHP4Safety/virtual-human-platform).

The content of the platform is configured in a second repository,
[`virtual-x-platform-config`](https://github.com/YOUR-ORG/virtual-x-platform-config): its glossary, its tools and
methods, and its use cases.

The content is kept as linked data. At its first start, the platform is *launched*: it reads the configuration
repository and the other sources, converts them to RDF, checks them against SHACL shapes, and stores them as records in a SQLite
database. From then on, the records are shown on the pages, served in JSON-LD, Turtle, N-Triples and Markdown, and
edited in the record editor or through the records API.

| Source | Read | What it gives |
|---|---|---|
| `glossary/` of the configuration repository | pinned at launch; weekly | the terms, including the process flow steps |
| `cloud/` of the configuration repository | once, at launch | the tools and the methods |
| `casestudies/` of the configuration repository | once, at launch | the use cases and their questions |
| `linkeddata/launch/site/` in this repository | once, at launch | the home page, the project, training, impact and legal pages |
| Compound Wiki | weekly | the compounds of the chemicals table of the glossary |
| SPDX, Wikidata, ROR, DOI, the Ontology Lookup Service | weekly | licences, readiness levels, organisations, publications, ontology terms |
| Zenodo, BioStudies, PeerTube, NWOpen | weekly, **switched off** in the template | datasets, models, videos, grants |

The tools, methods, use cases and pages are read once. After the launch, change them in the editor (`/admin/`):
later changes to their files are not read again.

The design of the linked data is described in [linkeddata/README.md](linkeddata/README.md).

## Make it yours

The settings are in [`linkeddata/model/v1/settings.yaml`](linkeddata/model/v1/settings.yaml):

| Setting | Meaning |
|---|---|
| `title` | the name of the platform |
| `base` | the public address of the platform. The records are stored with their full addresses: set it before the first launch |
| `project` | the name and address of the project behind the platform |
| `glossary` | the namespace of the glossary terms and the address of the glossary website |
| `contact form`, `visit counter` | optional: the endpoint of the contact form (Formspark, Formspree) and a GoatCounter address |
| `vocabularies` | the pinned files of the vocabularies, including the glossary (`glossary.ttl`) |
| `kinds` | the kinds of records, their classes and their names in the menus |

The sources are in [`linkeddata/sources/`](linkeddata/sources) (read weekly) and
[`linkeddata/launch/`](linkeddata/launch) (read once). Each is a YAML file with its addresses. A source with
`enabled: false` is not read: set your Zenodo community, BioStudies collection, PeerTube account or grant there and
switch it on.

The use cases are listed in [`linkeddata/launch/casestudies.yaml`](linkeddata/launch/casestudies.yaml): the content
file of each use case, and the code of each question in the tool and method catalogues (`reg_q_1a` is the question
`casestudies/demo/Q1`).

Then replace the placeholders:

| What | Where |
|---|---|
| Logo and icons | `static/images/logo.svg`, `logo.png`, `icon.svg`, `icon.png`, `icon-hosted.svg`, `usecase.svg` |
| Partner logos | `static/images/partners/` and its `partners.txt` |
| The text of the home, project, training, impact and legal pages | `linkeddata/launch/site/*.html` before the launch; the editor after it |
| Colours | `bootstrap-custom/custom.scss` (see [CSS styles](#css-styles)) |
| Docker image name | `.github/workflows/docker-publish.yml` |

### A change of the glossary

The platform uses a pinned copy of the glossary, so that the terms of the shapes and the records do not change
unnoticed. The template holds the demo glossary in `linkeddata/model/v1/vocabularies/glossary.ttl`. After a change
of the glossary on GitHub:

```shell
python -m linkeddata pin glossary   # download the glossary, pin its SHA-256, and list its process flow steps in the use case profile
python -m linkeddata model          # write the generated shapes and tables
python -m linkeddata check
```

and commit the changed files. The process flow steps are the terms whose label ends with `(Process Flow Step)`, in the
order of their identifiers. They are the values allowed for the steps of the questions of a use case
(`linkeddata/model/v1/profiles/CaseStudy/0.1-DRAFT/CaseStudy.ttl`).

## Installation

Python 3.12 or later is needed, for rdfsolve. On Debian, install what Debian has:

```shell
sudo apt install python3-flask python3-requests python3-werkzeug python3-sqlalchemy python3-nh3 python3-pyld \
    python3-pandas python3-rdflib python3-pil python3-yaml python3-bs4 gunicorn
```

and the rest, which Debian does not have, in a virtual environment that also sees the Debian packages:

```shell
python3 -m venv --system-site-packages venv
venv/bin/pip install "rdfsolve[validation] @ git+https://github.com/jmillanacosta/rdfsolve@84aa648ed98c4f5009eb83f450bd6b167ff0be00" \
    pyshacl pyoxigraph flask-smorest==0.47.0 rocrate markdownify Flask-Limiter==4.1.1
```

Or install everything with `pip install -r requirements.txt`.

## Run it

```shell
python -m linkeddata check     # check the vocabularies, the generated files and the database
python -m linkeddata launch    # once: read all sources into a new database (in instance/, or PLATFORM_STATE)
python app.py                  # serve the platform at http://localhost:5050/
```

With `FLASK_DEBUG=1`, the Flask debugger and reloader are on, for development. Do not set it in production.

### With a local copy of the configuration repository

Before the configuration repository is on GitHub, a launch can read it from a local folder. `PLATFORM_MIRRORS` gives
pairs of `<address prefix>=<replacement>`, separated by spaces; a replacement is a web address or a folder:

```shell
CONFIG=$(cd ../virtual-x-platform-config && pwd)
PLATFORM_MIRRORS="https://raw.githubusercontent.com/YOUR-ORG/virtual-x-platform-config/refs/heads/main/=$CONFIG/ \
https://YOUR-ORG.github.io/virtual-x-platform-config/cloud/=$CONFIG/cloud/docs/" \
python -m linkeddata launch
```

The `Makefile` in the template folder does this with `make launch`.

### Editors

The record editor is at `/admin/`. Editors sign in at `/login/` with ORCID, or with a write token. Set:

- `PLATFORM_EDITORS`: the ORCID iDs of the editors, separated by commas;
- `ORCID_CLIENT_ID`, `ORCID_CLIENT_SECRET`: the credentials of the platform for the ORCID public API, with the
  redirect URI `<platform>/orcid/callback/`;
- `SECRET_KEY`: a long random text that signs the sessions.

Without ORCID, make a write token on the command line and sign in with it:

```shell
python -m linkeddata token 0000-0002-1825-0097 "Your Name" tools methods casestudies pages
```

All settings are listed in [linkeddata/README.md](linkeddata/README.md#write-records).

### With Docker

```shell
docker build -t virtual-x-platform .
docker run -d -p 5000:5050 -v vxp_data:/data -e SECRET_KEY=<a long random text> -e PLATFORM_LAUNCH=1 virtual-x-platform
```

The platform is then at [http://localhost:5000/](http://localhost:5000/). The database is kept in the volume `/data`.
With `PLATFORM_LAUNCH=1`, the container launches the platform at a start without a database; a kept database is
never launched again. `SECRET_KEY`, `ORCID_CLIENT_ID`, `ORCID_CLIENT_SECRET` and `GITHUB_TOKEN` can also be given as
Docker secrets of their names in lower case, such as `/run/secrets/secret_key`.

Run the weekly import, for example with cron:

```
0 3 * * 1  docker exec platform python -m linkeddata import
```

### Published images

The workflow `.github/workflows/docker-publish.yml` builds the image and pushes it to Docker Hub for every published
GitHub Release. Set the image name in the workflow (`IMAGE`), and add the repository secrets `DOCKERHUB_USERNAME` and
`DOCKERHUB_TOKEN` (a Docker Hub access token with Read & Write scope).

## Tests

```shell
python -m pytest tests
```

The tests use small inputs and run offline, apart from the first download of the pinned vocabularies.

## Project structure

```
├── app.py                # the pages of the website (Flask)
├── admin/                # write tokens, sign-ins, and the writes of records
├── database/             # the SQLite database and its release tables
├── linkeddata/           # the model, the sources and their parsers, the launch and the imports
│   ├── model/v1/         # settings.yaml, the JSON-LD context, the profiles, the pinned vocabularies
│   ├── sources/          # the sources read each week
│   ├── launch/           # the sources read once, at launch, with the site pages in launch/site/
│   └── parsers/          # one parser for each source
├── routes/               # the records API, the editor, the changes, the sign-in
├── static/               # CSS, JavaScript (including JSmol), images
├── templates/            # Jinja2 templates
└── tests/
```

## CSS styles

Do as much as possible with native Bootstrap 5 classes. The colours are defined in `bootstrap-custom/custom.scss`.
Their names keep the prefix of the original platform (`vhpblue`, `vhppink`, ...), because they are used as class
names throughout the templates (`btn-vhpblue`, `text-vhppurple`). To change the colours, change the values and
recompile:

```bash
cd bootstrap-custom
npm install bootstrap sass --save-dev
npx sass --load-path=node_modules custom.scss bootstrap-custom.css
mv bootstrap-custom.css ../static/css/
```

## License and attribution

The code is licensed under the [GNU Affero General Public License v3](LICENSE.md). It is derived from the
[VHP4Safety Virtual Human Platform](https://github.com/VHP4Safety/virtual-human-platform); see
[`CITATION.cff`](CITATION.cff) for how to cite the original work.

The PBPK vocabulary (`pbpk:`) keeps the addresses of VHP4Safety, as the RO-Crates of published PBPK models use them.
