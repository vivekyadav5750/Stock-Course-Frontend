export async function renderTextFileFromUrl(objectUrl: string, container: HTMLDivElement): Promise<void> {
    try {
        const resp = await fetch(objectUrl);
        if (!resp.ok) throw new Error(`Failed to fetch file: ${resp.statusText}`);
        const text = await resp.text();

        URL.revokeObjectURL(objectUrl);

        const lines = text.split(/\r\n|\n/);

        // clear & prepare container
        container.innerHTML = '';
        Object.assign(container.style, {
            overflow: 'auto',
            width: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box'
        });

        // wrapper flex container
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            display: 'grid',
            gridTemplateColumns: '50px 1fr',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap', // wrap text
            wordBreak: 'break-word', // break long words
            lineHeight: '1.4',
            width: '100%'
        });

        // populate lines
        lines.forEach((line, i) => {
            const numDiv = document.createElement('div');
            numDiv.textContent = String(i + 1);
            Object.assign(numDiv.style, {
                textAlign: 'right',
                marginRight: '1em',
                color: '#888',
                userSelect: 'none'
            });

            const textDiv = document.createElement('div');

            textDiv.textContent = line;
            wrapper.append(numDiv, textDiv);
        });

        container.appendChild(wrapper);
    } catch (err) {
        console.error('Error rendering text file:', err);
        container.textContent = 'Error loading file.';
    }
}
