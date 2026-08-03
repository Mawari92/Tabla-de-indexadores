## Tabla

<img 
  alt="indexadores-julio-2026" 
  src="https://github.com/user-attachments/assets/ddc0e20b-e284-4139-861c-99ce3e8d2b53" 
  style="max-width: 100%; height: auto; display: block; margin: 0 auto;" 
/>



## Descargar la imagen

  <!-- Enlace Estilizado como Botón (Compatible con GitHub Pages) -->
<div style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 15px; box-sizing: border-box;">
  
 
<a 
  href="#" 
  onclick="descargarImagen('https://github.com/user-attachments/assets/ddc0e20b-e284-4139-861c-99ce3e8d2b53', 'imagen.png'); return false;"
  style="
    display: inline-block;
    padding: 12px 24px; 
    background-color: #0969da; 
    color: #ffffff !important; 
    text-decoration: none;
    border-radius: 8px; 
    font-size: 14px;
    font-weight: 600; 
    font-family: sans-serif;
    cursor: pointer;
  ">
  💾 Descargar Imagen
</a>

<script>
  async function descargarImagen(url, nombreArchivo) {
    try {
      const respuesta = await fetch(url);
      const blob = await respuesta.blob();
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(blob);
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    } catch (error) {
      alert("No se pudo descargar la imagen. Verifica que el enlace siga activo.");
    }
  }
</script>




## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
