let filesArray = [];

document.getElementById('pdfFiles').addEventListener('change', (event) => {
    const fileList = document.getElementById('fileList');
    const files = event.target.files;
    const downloadLink = document.getElementById('downloadLink');
    fileList.style.display = 'block';
    downloadLink.style.display = 'none';
    for (const file of files) {
        if (file.type === 'application/pdf') {
            addFileToList(file);
        }
    }
    toggleMergeButton(filesArray.length);
});

function addFileToList(file) {
    const fileList = document.getElementById('fileList');
    const listItem = document.createElement('li');
    listItem.textContent = file.name;
    listItem.dataset.filename = file.name; 
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', () => {
        filesArray = filesArray.filter(f => f.name !== file.name);
        fileList.removeChild(listItem);
        toggleMergeButton(filesArray.length);
        if (filesArray.length === 0) {
            fileList.style.display = 'none';
        }
    });
    listItem.appendChild(removeBtn);
    fileList.appendChild(listItem);
    filesArray.push(file);
}

document.getElementById('mergeBtn').addEventListener('click', async () => {
    if (filesArray.length < 2) {
        alert('Please select at least two PDF files to merge.');
        return;
    }

    document.getElementById('loader').style.display = 'flex';

    try {
        const mergedPdf = await PDFLib.PDFDocument.create();

        for (const file of filesArray) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach(page => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.getElementById('downloadLink');
        const fileList = document.getElementById('fileList');
        downloadLink.href = url;
        downloadLink.download = 'merged.pdf';
        downloadLink.style.display = 'block';
        downloadLink.textContent = 'Download Merged PDF';
        fileList.style.display = 'none';

        clearFileList();
        toggleMergeButton(0);
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('An error occurred while merging the PDFs. Please try again.');
    } finally {
        document.getElementById('loader').style.display = 'none';
    }
});
function toggleMergeButton(fileCount) {
    const mergeBtn = document.getElementById('mergeBtn');
    if (fileCount >= 2) {
        mergeBtn.style.display = 'inline-block';
    } else {
        mergeBtn.style.display = 'none';
    }
}

function clearFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    filesArray = [];
    document.getElementById('pdfFiles').value = ''; 
    fileList.style.display='none';
    
}

const sortable = new Sortable(document.getElementById('fileList'), {
    animation: 150,
    onEnd: (evt) => {
        const newOrder = Array.from(evt.to.children).map(item => item.dataset.filename);
        filesArray = newOrder.map(filename => filesArray.find(file => file.name === filename));
    }
});
