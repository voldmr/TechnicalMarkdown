# Tables

## HTML Table

:::{include-if-format=latex;html;html5;json;native}
- Included html file as `html`.
- Markdown citations/cross refeferences do not work inside.
- HTML citations dont work.
- Table caption is not parsed `table_caption` not allowed as extension.
:::
```{.include format=html+tex_math_dollars .var-replace include-if-format=latex;html;html5;json;native}
chapters/tables/TableExample.html
```

:::{include-if-format=latex;json;native}
## \LaTeX\ Table
- Included latex file as raw `latex`.
- Converted from `.html` by `convert-tables.py` and `table.json`.
- Latex citations do work inside.
:::

```{.include format=latex raw=true include-if-format=latex;json;native}
chapters/tables-tex/TableExample.tex
```

## Markdown Table {#sec:multi-line-table}

- Included markdown files.
- Cross references do work here.
```{.include}
chapters/TableExample.md
```
