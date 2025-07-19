## Project Structure

```
project-root/
│
├── ckeditor/
│   ├── editor.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js   
├── js/
│   └── injetarEditor.js   # (optional, for your own integration)
├── index.html
├── README.md
```

## Usage

### 1. Prepare Your HTML
Add a container div where you want the editor:

```html
<div id="myEditor"></div>
```

### 2. Inject the Editor via JavaScript
Use the provided loader script to load the editor dynamically:

```html
<script src="ckeditor/js/injetarEditor.js"></script>
<script>
  injetarEditor('myEditor');
</script>
```

This will:
- Fetch the editor HTML and inject it into the div
- Dynamically load the required CSS and FontAwesome
- Dynamically load and initialize the editor JavaScript

### 3. Customization
- **Toolbar**: Edit `textarea/editor.html` to add/remove buttons or features
- **Styles**: Edit `textarea/css/styles.css` for custom look and feel
- **Icons**: Uses FontAwesome CDN (can be replaced or removed)

### 4. Features in Detail
- **Paste images**: Ctrl+V to insert images as base64
- **Resize images**: Click image to show handles, drag to resize (corners = aspect ratio, sides = free)
- **Formatting**: Bold, italic, underline, strikethrough, lists, alignment, colors, font family/size
- **Modals**: For inserting links and images
- **Placeholder**: Shows when editor is empty
- **Keyboard shortcuts**: Ctrl+B/I/U/Z/Y/A

## Contributing
Pull requests and suggestions are welcome! Please open an issue or PR for improvements or bug fixes.

## License
MIT License. Free for personal and commercial use. 

<img width="1905" height="927" alt="image" src="https://github.com/user-attachments/assets/4f378f07-45f4-48ae-be87-6530ccba9932" />
