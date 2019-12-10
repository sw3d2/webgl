# What's this?

![](/pics/vscode.png)

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