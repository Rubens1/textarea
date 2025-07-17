// Main editor class
class RichTextEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.toolbar = document.querySelector('.toolbar');
        this.linkModal = document.getElementById('linkModal');
        this.imageModal = document.getElementById('imageModal');

        // Variables for resizing
        this.resizing = false;
        this.currentHandle = null;
        this.targetImg = null;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;

        this.init();
    }

    init() {
        this.setupToolbar();
        this.setupModals();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupColorPickers();
        this.setupFontSelectors();
        this.setupPasteHandler();
        this.setupImageResizeHandles();
    }

    setupToolbar() {
        const toolbarButtons = this.toolbar.querySelectorAll('[data-command]');
        toolbarButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const command = button.getAttribute('data-command');
                this.executeCommand(command);
                this.updateButtonStates();
            });
        });
        document.getElementById('linkBtn').addEventListener('click', () => this.showLinkModal());
        document.getElementById('imageBtn').addEventListener('click', () => this.showImageModal());
    }

    setupModals() {
        const linkModal = this.linkModal;
        const closeLinkModal = linkModal.querySelector('.close');
        const insertLinkBtn = document.getElementById('insertLink');
        closeLinkModal.addEventListener('click', () => this.hideModal(linkModal));
        insertLinkBtn.addEventListener('click', () => this.insertLink());

        const imageModal = this.imageModal;
        const closeImageModal = imageModal.querySelector('.close');
        const insertImageBtn = document.getElementById('insertImage');
        closeImageModal.addEventListener('click', () => this.hideModal(imageModal));
        insertImageBtn.addEventListener('click', () => this.insertImage());

        window.addEventListener('click', (e) => {
            if (e.target === linkModal) this.hideModal(linkModal);
            if (e.target === imageModal) this.hideModal(imageModal);
        });
    }

    setupEventListeners() {
        this.editor.addEventListener('input', () => {
            this.updateButtonStates();
            this.updatePlaceholder();
        });
        this.editor.addEventListener('keyup', () => {
            this.updateButtonStates();
            this.updatePlaceholder();
        });
        this.editor.addEventListener('mouseup', () => {
            this.updateButtonStates();
            this.updatePlaceholder();
        });
        // Placeholder visual
        this.editor.addEventListener('focus', () => {
            if (this.editor.innerHTML === '' || this.editor.innerHTML === '<br>') {
                this.editor.innerHTML = '';
            }
            this.editor.classList.remove('editor-placeholder');
        });
        this.editor.addEventListener('blur', () => {
            this.updatePlaceholder();
        });
        // Initialize placeholder if empty
        this.updatePlaceholder();
        // Select image on click
        this.editor.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.selectImageWithHandles(e.target);
            }
        });
        // Global resizing
        document.addEventListener('mousemove', (e) => this.handleResizeMove(e));
        document.addEventListener('mouseup', () => this.handleResizeEnd());
        // Remove selection when clicking outside any image
        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.image-resize-wrapper')) {
                this.removeImageHandles();
            }
        });
        // Enter before/after image: insert <p><br></p>
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const sel = window.getSelection();
                if (sel && sel.rangeCount) {
                    const range = sel.getRangeAt(0);
                    let node = range.startContainer;
                    if (node.nodeType === 3) node = node.parentNode;
                    if (node.tagName === 'IMG' || (node.previousSibling && node.previousSibling.tagName === 'IMG') || (node.nextSibling && node.nextSibling.tagName === 'IMG')) {
                        e.preventDefault();
                        const p = document.createElement('p');
                        p.innerHTML = '<br>';
                        if (node.tagName === 'IMG' && range.startOffset === 0) {
                            node.parentNode.insertBefore(p, node);
                        } else if (node.tagName === 'IMG') {
                            node.parentNode.insertBefore(p, node.nextSibling);
                        } else if (node.previousSibling && node.previousSibling.tagName === 'IMG') {
                            node.parentNode.insertBefore(p, node);
                        } else if (node.nextSibling && node.nextSibling.tagName === 'IMG') {
                            node.parentNode.insertBefore(p, node.nextSibling.nextSibling);
                        }
                        // Place cursor in new paragraph
                        const newRange = document.createRange();
                        newRange.setStart(p, 0);
                        newRange.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(newRange);
                        this.updatePlaceholder();
                    }
                }
            }
        });
    }

    updatePlaceholder() {
        if (this.editor.innerHTML === '' || this.editor.innerHTML === '<br>' || this.editor.innerHTML === '<p><br></p>') {
            this.editor.classList.add('editor-placeholder');
        } else {
            this.editor.classList.remove('editor-placeholder');
        }
    }

    setupKeyboardShortcuts() {
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.executeCommand('bold');
            } else if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                this.executeCommand('italic');
            } else if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                this.executeCommand('underline');
            } else if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.executeCommand('selectAll');
            } else if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.executeCommand('undo');
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.executeCommand('redo');
            }
        });
    }

    setupPasteHandler() {
        this.editor.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.style.borderRadius = '8px';
                        img.style.margin = '1em 0';
                        this.insertElement(img);
                        this.wrapImageWithHandles(img);
                    };
                    reader.readAsDataURL(blob);
                    return;
                }
            }
        });
    }

    setupImageResizeHandles() {
        // Add handles for already existing images
        const imgs = this.editor.querySelectorAll('img');
        imgs.forEach(img => this.wrapImageWithHandles(img));
    }

    selectImageWithHandles(img) {
        this.removeImageHandles();
        this.wrapImageWithHandles(img);
        img.classList.add('selected-image');
    }

    wrapImageWithHandles(img) {
        // If already in a wrapper, do nothing
        if (img.parentNode && img.parentNode.classList && img.parentNode.classList.contains('image-resize-wrapper')) {
            this.addHandles(img.parentNode, img);
            img.classList.add('selected-image');
            return;
        }
        // Create wrapper
        const wrapper = document.createElement('span');
        wrapper.className = 'image-resize-wrapper';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        this.addHandles(wrapper, img);
        img.classList.add('selected-image');
    }

    addHandles(wrapper, img) {
        // Remove old handles
        wrapper.querySelectorAll('.resize-handle').forEach(h => h.remove());
        // Handle positions
        const positions = [
            { cls: 'nw', cursor: 'nw-resize' },
            { cls: 'n', cursor: 'n-resize' },
            { cls: 'ne', cursor: 'ne-resize' },
            { cls: 'e', cursor: 'e-resize' },
            { cls: 'se', cursor: 'se-resize' },
            { cls: 's', cursor: 's-resize' },
            { cls: 'sw', cursor: 'sw-resize' },
            { cls: 'w', cursor: 'w-resize' }
        ];
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `resize-handle ${pos.cls}`;
            handle.style.cursor = pos.cursor;
            handle.addEventListener('mousedown', (e) => this.handleResizeStart(e, img, pos.cls));
            wrapper.appendChild(handle);
        });
    }

    removeImageHandles() {
        // Remove handles and wrapper from all images
        const wrappers = this.editor.querySelectorAll('.image-resize-wrapper');
        wrappers.forEach(wrapper => {
            const img = wrapper.querySelector('img');
            if (img) img.classList.remove('selected-image');
            // Remove handles
            wrapper.querySelectorAll('.resize-handle').forEach(h => h.remove());
            // Remove wrapper if not direct child of editor
            if (wrapper.parentNode && wrapper.parentNode !== this.editor) {
                wrapper.parentNode.insertBefore(img, wrapper);
                wrapper.remove();
            }
        });
    }

    handleResizeStart(e, img, handleDir) {
        e.preventDefault();
        e.stopPropagation();
        this.resizing = true;
        this.currentHandle = handleDir;
        this.targetImg = img;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.startWidth = img.offsetWidth;
        this.startHeight = img.offsetHeight;
        document.body.style.cursor = e.target.style.cursor;
        document.body.style.userSelect = 'none';
    }

    handleResizeMove(e) {
        if (!this.resizing || !this.targetImg) return;
        let dx = e.clientX - this.startX;
        let dy = e.clientY - this.startY;
        let newWidth = this.startWidth;
        let newHeight = this.startHeight;
        const aspectRatio = this.startWidth / this.startHeight;
        // Corner: keep aspect ratio
        if (['nw','ne','se','sw'].includes(this.currentHandle)) {
            let delta = 0;
            if (this.currentHandle === 'nw') {
                delta = Math.min(-dx, -dy);
                newWidth = Math.max(30, this.startWidth - delta);
                newHeight = Math.max(30, newWidth / aspectRatio);
            } else if (this.currentHandle === 'ne') {
                delta = Math.min(dx, -dy);
                newWidth = Math.max(30, this.startWidth + delta);
                newHeight = Math.max(30, newWidth / aspectRatio);
            } else if (this.currentHandle === 'se') {
                delta = Math.max(dx, dy);
                newWidth = Math.max(30, this.startWidth + delta);
                newHeight = Math.max(30, newWidth / aspectRatio);
            } else if (this.currentHandle === 'sw') {
                delta = Math.min(-dx, dy);
                newWidth = Math.max(30, this.startWidth - delta);
                newHeight = Math.max(30, newWidth / aspectRatio);
            }
        } else if (this.currentHandle === 'n') {
            newHeight = Math.max(30, this.startHeight - dy);
        } else if (this.currentHandle === 's') {
            newHeight = Math.max(30, this.startHeight + dy);
        } else if (this.currentHandle === 'e') {
            newWidth = Math.max(30, this.startWidth + dx);
        } else if (this.currentHandle === 'w') {
            newWidth = Math.max(30, this.startWidth - dx);
        }
        this.targetImg.style.width = newWidth + 'px';
        this.targetImg.style.height = newHeight + 'px';
        // Cursor remains as the handle
        document.body.style.cursor = this.getHandleCursor(this.currentHandle);
    }

    handleResizeEnd() {
        if (this.resizing) {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            this.resizing = false;
            this.currentHandle = null;
            this.targetImg = null;
        }
    }

    getHandleCursor(dir) {
        const map = {
            'nw': 'nw-resize', 'n': 'n-resize', 'ne': 'ne-resize',
            'e': 'e-resize', 'se': 'se-resize', 's': 's-resize',
            'sw': 'sw-resize', 'w': 'w-resize'
        };
        return map[dir] || 'default';
    }

    setupColorPickers() {
        const textColor = document.getElementById('textColor');
        const bgColor = document.getElementById('bgColor');
        textColor.addEventListener('change', (e) => {
            this.executeCommand('foreColor', e.target.value);
        });
        bgColor.addEventListener('change', (e) => {
            this.executeCommand('hiliteColor', e.target.value);
        });
    }

    setupFontSelectors() {
        const fontFamily = document.getElementById('fontFamily');
        const fontSize = document.getElementById('fontSize');
        fontFamily.addEventListener('change', (e) => {
            this.executeCommand('fontName', e.target.value);
        });
        fontSize.addEventListener('change', (e) => {
            this.executeCommand('fontSize', e.target.value);
        });
    }

    executeCommand(command, value = null) {
        this.editor.focus();
        if (command === 'selectAll') {
            document.execCommand('selectAll', false, null);
        } else if (value) {
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, null);
        }
        this.updateButtonStates();
    }

    updateButtonStates() {
        const buttons = this.toolbar.querySelectorAll('[data-command]');
        buttons.forEach(button => {
            const command = button.getAttribute('data-command');
            if (command === 'bold' || command === 'italic' || command === 'underline' || command === 'strikeThrough') {
                if (document.queryCommandState(command)) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
    }

    showLinkModal() {
        this.linkModal.style.display = 'block';
        document.getElementById('linkUrl').focus();
    }

    showImageModal() {
        this.imageModal.style.display = 'block';
        document.getElementById('imageUrl').focus();
    }

    hideModal(modal) {
        modal.style.display = 'none';
        const inputs = modal.querySelectorAll('input[type=text]');
        inputs.forEach(input => input.value = '');
    }

    insertLink() {
        const url = document.getElementById('linkUrl').value.trim();
        const text = document.getElementById('linkText').value.trim();
        if (url) {
            const linkText = text || url;
            const linkHTML = `<a href="${url}" target="_blank">${linkText}</a>`;
            this.insertHTML(linkHTML);
            this.hideModal(this.linkModal);
        }
    }

    insertImage() {
        const url = document.getElementById('imageUrl').value.trim();
        const alt = document.getElementById('imageAlt').value.trim();
        if (url) {
            const imgHTML = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto;">`;
            this.insertHTML(imgHTML);
            this.hideModal(this.imageModal);
            // Add handles for the new image
            const newImg = this.editor.querySelector(`img[src="${url}"]`);
            if (newImg) this.wrapImageWithHandles(newImg);
        }
    }

    insertHTML(html) {
        this.editor.focus();
        if (window.getSelection) {
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createRange().createContextualFragment(html));
            }
        } else if (document.selection && document.selection.createRange) {
            const range = document.selection.createRange();
            range.pasteHTML(html);
        }
    }

    insertElement(element) {
        this.editor.focus();
        if (window.getSelection) {
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(element);
            }
        } else if (document.selection && document.selection.createRange) {
            const range = document.selection.createRange();
            range.pasteHTML(element.outerHTML);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const editor = new RichTextEditor();
    window.richTextEditor = editor;
});

// Utility function to format text
function formatText(command) {
    document.execCommand(command, false, null);
}

// Function to insert text at a specific position
function insertTextAtCursor(text) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
    }
}

// Function to get the current selection
function getSelectedText() {
    const selection = window.getSelection();
    return selection.toString();
}

// Function to replace the current selection
function replaceSelection(text) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
    }
} 