# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - link "Sistema de Ventas" [ref=e8] [cursor=pointer]:
          - /url: /dashboard
        - generic [ref=e9]:
          - link "Dashboard" [ref=e10] [cursor=pointer]:
            - /url: /dashboard
          - link "Productos" [ref=e11] [cursor=pointer]:
            - /url: /products
          - link "Chat" [ref=e12] [cursor=pointer]:
            - /url: /chat
      - generic [ref=e13]:
        - generic [ref=e14]:
          - paragraph [ref=e15]: Test Comprador
          - paragraph [ref=e16]: Comprador
        - link "Mi Perfil" [ref=e17] [cursor=pointer]:
          - /url: /profile
          - button [ref=e18]:
            - img [ref=e19]
          - generic: Mi Perfil
        - button "Salir" [ref=e22]:
          - img [ref=e23]
          - generic [ref=e26]: Salir
  - main [ref=e27]:
    - generic [ref=e29]:
      - heading "Acceso Denegado" [level=2] [ref=e30]
      - paragraph [ref=e31]: No tienes permisos para acceder a esta página.
      - paragraph [ref=e32]: "Roles permitidos: moderador, administrador"
```