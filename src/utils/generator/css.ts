interface Styles {
  [key: string]: string;
}

interface ElementNode {
  tag: string;
  children?: ElementNode[];
}

interface FormConfiguration {
  fields: ElementNode[];
}

const styles: Styles = {
  'el-rate': '.el-rate{display: inline-block; vertical-align: text-top;}',
  'el-upload': '.el-upload__tip{line-height: 1.2;}'
};

function addCss(cssList: string[], el: ElementNode): void {
  const css = styles[el.tag];
  if (css && cssList.indexOf(css) === -1) {
    cssList.push(css);
  }
  if (el.children) {
    el.children.forEach((child) => addCss(cssList, child));
  }
}

export function makeUpCss(conf: FormConfiguration): string {
  const cssList: string[] = [];
  conf.fields.forEach((el) => addCss(cssList, el));
  return cssList.join('\n');
}
