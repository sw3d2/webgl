# What's this?

![](/pics/vscode.png)

# What's iswaac?

The treemap above looks like a chip, so I came up with the "interactive software visualization as a chip" acronym.

# How it works

```
  TS Compiler API
        V
  *.ts ----> AST ---> d3.treemap
              ^           |
              | ?         |
  *.java -----+           V
                     (x,y,z) boxes
                       3d.json
                          |
                          |
                          v
                        WebGL
```

# Prior Art

[3D Treemaps That Use Extrusion](https://datavizcatalogue.com/blog/3d-treemaps-that-use-extrusion/)

# License

GNU AGPL v3
