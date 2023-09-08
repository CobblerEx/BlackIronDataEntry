document.addEventListener('DOMContentLoaded', () => {
    const csvFileInput = document.getElementById('csvFile');
    const uploadedData = document.getElementById('uploadedData');

    csvFileInput.addEventListener('change', handleFileUpload);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            parseCSV(file);
        }
    }

    function parseCSV(file) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: displayData,
            error: (error) => {
                console.error('CSV Parsing Error:', error.message);
            },
        });
    }

    function displayData(results) {
        const data = results.data;
        if (data.length === 0) {
            alert('No data found in the CSV file.');
            return;
        }

        // Clear existing table content
        uploadedData.innerHTML = '';

        // Create table headers
        const headers = Object.keys(data[0]);
        const headerRow = document.createElement('tr');
        headers.forEach((header) => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        uploadedData.appendChild(headerRow);

        // Create table rows with data
        data.forEach((row) => {
            const tr = document.createElement('tr');
            headers.forEach((header) => {
                const td = document.createElement('td');
                td.textContent = row[header];
                tr.appendChild(td);
            });
            uploadedData.appendChild(tr);
        });

        // Add edit and delete buttons to each row
        const editButtons = document.querySelectorAll('td');
        editButtons.forEach((button) => {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            button.appendChild(editButton);
            editButton.addEventListener('click', handleEdit);
        });
    }

    function handleEdit(event) {
        const td = event.target.parentElement;
        const tr = td.parentElement;
        const columns = tr.children;
        const rowData = {};
        for (let i = 0; i < columns.length - 1; i++) {
            const header = uploadedData.rows[0].cells[i].textContent;
            rowData[header] = columns[i].textContent;
        }

        // Redirect to the original page with data for editing
        const url = `original_page.html?data=${encodeURIComponent(JSON.stringify(rowData))}`;
        window.location.href = url;
    }
});