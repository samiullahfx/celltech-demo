// Interface for form field data
interface FormField {
    type: string;
    label: string;
    options?: string[];
}

// Interface for form structure
interface FormStructure {
    fields: FormField[];
}

// Interface for form submission data
interface SubmissionData {
    [key: string]: string | string[];
}

// Initializing form structure and submissions
let currentForm: FormStructure = { fields: [] };
let submittedForms: SubmissionData[] = [];

// Helper function to create a field in the DOM
function createField(type: string, label: string, options?: string[]) {
    const formContainer = document.getElementById('dynamicForm') as HTMLFormElement;

    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'form-group';
    fieldContainer.dataset.type = type;
    fieldContainer.dataset.label = label;

    const labelElement = document.createElement('label');
    labelElement.textContent = label;

    if (type === 'radio' || type === 'checkbox') {
        const optionsContainer = document.createElement('div');
        options?.forEach((option) => {
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
    } else {
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
        currentForm.fields.forEach((field) =>
            createField(field.type, field.label, field.options)
        );
    }

    const storedSubmissions = localStorage.getItem('submittedForms');
    if (storedSubmissions) {
        submittedForms = JSON.parse(storedSubmissions);
        displaySubmittedForms();
    }
}

// Edit an existing field
function editField(fieldContainer: HTMLElement) {
    const type = fieldContainer.dataset.type as string;
    const label = fieldContainer.dataset.label as string;

    (document.getElementById('fieldType') as HTMLSelectElement).value = type;
    (document.getElementById('fieldLabel') as HTMLInputElement).value = label;

    if (type === 'radio' || type === 'checkbox') {
        const options = Array.from(fieldContainer.querySelectorAll('input')).map(
            (input) => (input as HTMLInputElement).value
        );
        (document.getElementById('fieldOptions') as HTMLInputElement).value = options.join(',');
    }

    fieldContainer.remove();
    currentForm.fields = currentForm.fields.filter((field) => field.label !== label);
    saveFormToLocalStorage();
}

// Delete a field
function deleteField(fieldContainer: HTMLElement) {
    const label = fieldContainer.dataset.label as string;
    fieldContainer.remove();
    currentForm.fields = currentForm.fields.filter((field) => field.label !== label);
    saveFormToLocalStorage();
}

// Save submitted form data
function saveSubmittedFormData() {
    const formContainer = document.getElementById('dynamicForm') as HTMLFormElement;
    const formData: SubmissionData = {};

    currentForm.fields.forEach((field) => {
        const inputElements = formContainer.querySelectorAll(`[name="${field.label}"]`);
        if (field.type === 'radio' || field.type === 'checkbox') {
            const selectedValues = Array.from(inputElements)
                .filter((input) => (input as HTMLInputElement).checked)
                .map((input) => (input as HTMLInputElement).value);
            formData[field.label] = selectedValues;
        } else {
            formData[field.label] = (inputElements[0] as HTMLInputElement)?.value || '';
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
                .map((key) => `<strong>${key}:</strong> ${Array.isArray(form[key]) ? (form[key] as string[]).join(', ') : form[key]}`)
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
    addFieldButton?.addEventListener('click', () => {
        const fieldType = (document.getElementById('fieldType') as HTMLSelectElement).value;
        const fieldLabel = (document.getElementById('fieldLabel') as HTMLInputElement).value;
        const fieldOptions = (document.getElementById('fieldOptions') as HTMLInputElement).value.split(',');

        if (fieldLabel) {
            const newField: FormField = {
                type: fieldType,
                label: fieldLabel,
                options: fieldType === 'radio' || fieldType === 'checkbox' ? fieldOptions : undefined,
            };

            currentForm.fields.push(newField);
            createField(newField.type, newField.label, newField.options);
            saveFormToLocalStorage();
        } else {
            alert('Please enter a field label.');
        }
    });

    const saveFormButton = document.getElementById('saveForm');
    saveFormButton?.addEventListener('click', saveSubmittedFormData);
});
