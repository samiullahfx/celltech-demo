"use strict";
// Initializing form structure and submissions
let currentForm = { fields: [] };
let submittedForms = [];
// Helper function to create a field in the DOM
function createField(type, label, options) {
    const formContainer = document.getElementById('dynamicForm');
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'form-group';
    fieldContainer.dataset.type = type;
    fieldContainer.dataset.label = label;
    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    if (type === 'radio' || type === 'checkbox') {
        const optionsContainer = document.createElement('div');
        options === null || options === void 0 ? void 0 : options.forEach((option) => {
            const optionLabel = document.createElement('label');
            optionLabel.className = type === 'radio' ? 'radio-inline' : 'checkbox-inline';
            const optionInput = document.createElement('input');
            optionInput.type = type;
            optionInput.name = label;
            optionInput.value = option;
            optionLabel.appendChild(optionInput);
            optionLabel.appendChild(document.createTextNode(option));
            optionsContainer.appendChild(optionLabel);
        });
        fieldContainer.appendChild(labelElement);
        fieldContainer.appendChild(optionsContainer);
    }
    else {
        const inputElement = document.createElement('input');
        inputElement.type = type;
        inputElement.className = 'form-control';
        inputElement.name = label;
        fieldContainer.appendChild(labelElement);
        fieldContainer.appendChild(inputElement);
    }
    // Add edit and delete buttons
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'btn btn-warning btn-sm mx-1';
    editButton.addEventListener('click', () => editField(fieldContainer));
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'btn btn-danger btn-sm mx-1';
    deleteButton.addEventListener('click', () => deleteField(fieldContainer));
    fieldContainer.appendChild(editButton);
    fieldContainer.appendChild(deleteButton);
    formContainer.appendChild(fieldContainer);
}
// Save form structure to localStorage
function saveFormToLocalStorage() {
    localStorage.setItem('formStructure', JSON.stringify(currentForm));
}
// Restore form structure from localStorage
function restoreFormFromLocalStorage() {
    const storedForm = localStorage.getItem('formStructure');
    if (storedForm) {
        const parsedForm = JSON.parse(storedForm);
        currentForm = {
            fields: parsedForm.fields || [],
        };
        currentForm.fields.forEach((field) => createField(field.type, field.label, field.options));
    }
    const storedSubmissions = localStorage.getItem('submittedForms');
    if (storedSubmissions) {
        submittedForms = JSON.parse(storedSubmissions);
        displaySubmittedForms();
    }
}
// Edit an existing field
function editField(fieldContainer) {
    const type = fieldContainer.dataset.type;
    const label = fieldContainer.dataset.label;
    document.getElementById('fieldType').value = type;
    document.getElementById('fieldLabel').value = label;
    if (type === 'radio' || type === 'checkbox') {
        const options = Array.from(fieldContainer.querySelectorAll('input')).map((input) => input.value);
        document.getElementById('fieldOptions').value = options.join(',');
    }
    fieldContainer.remove();
    currentForm.fields = currentForm.fields.filter((field) => field.label !== label);
    saveFormToLocalStorage();
}
// Delete a field
function deleteField(fieldContainer) {
    const label = fieldContainer.dataset.label;
    fieldContainer.remove();
    currentForm.fields = currentForm.fields.filter((field) => field.label !== label);
    saveFormToLocalStorage();
}
// Save submitted form data
function saveSubmittedFormData() {
    const formContainer = document.getElementById('dynamicForm');
    const formData = {};
    currentForm.fields.forEach((field) => {
        var _a;
        const inputElements = formContainer.querySelectorAll(`[name="${field.label}"]`);
        if (field.type === 'radio' || field.type === 'checkbox') {
            const selectedValues = Array.from(inputElements)
                .filter((input) => input.checked)
                .map((input) => input.value);
            formData[field.label] = selectedValues;
        }
        else {
            formData[field.label] = ((_a = inputElements[0]) === null || _a === void 0 ? void 0 : _a.value) || '';
        }
    });
    submittedForms.push(formData);
    localStorage.setItem('submittedForms', JSON.stringify(submittedForms));
    displaySubmittedForms();
}
// Display submitted forms
function displaySubmittedForms() {
    const submissionsContainer = document.getElementById('submittedForms');
    if (submissionsContainer) {
        submissionsContainer.innerHTML = '';
        submittedForms.forEach((form, index) => {
            const formDetails = document.createElement('div');
            formDetails.className = 'form-submission';
            const formContent = Object.keys(form)
                .map((key) => `<strong>${key}:</strong> ${Array.isArray(form[key]) ? form[key].join(', ') : form[key]}`)
                .join('<br>');
            formDetails.innerHTML = `<h5>Submission ${index + 1}</h5>${formContent}`;
            submissionsContainer.appendChild(formDetails);
        });
    }
}
// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    restoreFormFromLocalStorage();
    const addFieldButton = document.getElementById('addField');
    addFieldButton === null || addFieldButton === void 0 ? void 0 : addFieldButton.addEventListener('click', () => {
        const fieldType = document.getElementById('fieldType').value;
        const fieldLabel = document.getElementById('fieldLabel').value;
        const fieldOptions = document.getElementById('fieldOptions').value.split(',');
        if (fieldLabel) {
            const newField = {
                type: fieldType,
                label: fieldLabel,
                options: fieldType === 'radio' || fieldType === 'checkbox' ? fieldOptions : undefined,
            };
            currentForm.fields.push(newField);
            createField(newField.type, newField.label, newField.options);
            saveFormToLocalStorage();
        }
        else {
            alert('Please enter a field label.');
        }
    });
    const saveFormButton = document.getElementById('saveForm');
    saveFormButton === null || saveFormButton === void 0 ? void 0 : saveFormButton.addEventListener('click', saveSubmittedFormData);
});
