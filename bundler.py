import re
import os

ICON_TEMPLATE='''.{0}-icon {{
	height: 48px;
	width:  48px;
	mask-repeat: no-repeat;
	mask-size: 100%;
	background: {1};
	mask-image: url('data:image/svg+xml;utf8, {2}');
}}\n'''
def format_icon(_name, _color, _data):
	return ICON_TEMPLATE.format(_name.lower(), _color, str(_data))

SVG_RE = r'<svg.+<\/svg>{1}$'
ICON_PATH = "./images/icons/"
ICON_CSS_PATH = "./css/{0}-icons-new.css"
ICON_OPTIONS = {
	"dir": lambda f : f.is_dir(),
	"file": lambda f : f.is_file()}
def get_icon_data(_path=ICON_PATH, _filter="dir"):
	entries = [{ "name": f.name, "path": f.path } for f in os.scandir(_path) if ICON_OPTIONS[_filter](f)]

	if _filter == "dir":
		results = []
		for entry in entries:
			results.append([ICON_CSS_PATH.format(entry["name"].lower()), get_icon_data(entry["path"], "file")])
		return results
		
	elif _filter == "file":
		results = ""
		for entry in entries:
			icon = format_icon(
				entry["name"].split(".")[0].lower().replace("_", "-"),
				"white" if "map" in entry["path"] else "black",
				re.findall(SVG_RE, read_from_file(entry["path"]))[0])
			
			results += icon
		return results

EMBED_ICONS_TOGGLE = False
def embed_icons():
	if EMBED_ICONS_TOGGLE:
		for css_icon in get_icon_data():
			write_to_file(css_icon[0], css_icon[1])

def find_files_to_inject(_contents):
	matches = re.findall(r'\"__%__[\w\/\.\-]+__%__\"', str(_contents))
	return matches

def read_from_file(_relative_path):
	results = ""
	with open(_relative_path, "r") as data:
		results = data.read()
	
	return results

def write_to_file(_relative_path, _contents):
	with open(_relative_path, "w+") as f:
		f.writelines(_contents)
	
	return True

HTML_TEMPLATE = "./Table_Top_Tapper.template"
HTML_BUNDLED = "./Table_Top_Tapper.html"
def fill_in_template():
	html = read_from_file(HTML_TEMPLATE)
	replace_values = find_files_to_inject(html)

	for value in replace_values:
		cleaned = value.replace("\"__%__", "")
		cleaned = cleaned.replace("__%__\"", "")

		html = html.replace(value, read_from_file("./{0}".format(cleaned)))

	write_to_file(HTML_BUNDLED, html)

def main():
	embed_icons()
	fill_in_template()

main()