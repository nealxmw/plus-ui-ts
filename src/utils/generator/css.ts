export const styles: Record<string, string> = {
  'el-rate': '.el-rate { display: inline-block; vertical-align: text-top; }',
  'el-upload': '.el-upload__tip { line-height: 1.2; }'
};

export interface ComponentNode {
  tag: string;
  children?: ComponentNode[];
}

export interface FormConf {
  fields: ComponentNode[];
}

function addCss(cssList: string[], el: ComponentNode): void {
  const css = styles[el.tag];
  if (css && !cssList.includes(css)) {
    cssList.push(css);
  }
  if (el.children && el.children.length > 0) {
    el.children.forEach((child) => addCss(cssList, child));
  }
}

export function makeUpCss(conf: FormConf): string {
  const cssList: string[] = [];
  conf.fields.forEach((el) => addCss(cssList, el));
  return cssList.join('\n');
}
