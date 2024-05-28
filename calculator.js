document.addEventListener('DOMContentLoaded', () => {
    let selectedOptions = [];
    let area = 0;

    // Selectăm butoanele și caseta de input
    const feButton = document.getElementById('feButton');
    const cuButton = document.getElementById('cuButton');
    const alButton = document.getElementById('alButton');
    const areaInput = document.getElementById('areaInput');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultDiv = document.getElementById('result');
    const metalSelection = document.getElementById('metalSelection').querySelector('p');
	const homeButton = document.getElementById('homeButton');

    const metalNames = ['Fier', 'Cupru', 'Nichel'];

    // Adăugăm event listener pentru butoanele de metal
    feButton.addEventListener('click', () => {
    toggleSelection(0, feButton);
	});

	cuButton.addEventListener('click', () => {
    toggleSelection(1, cuButton);
	});

	alButton.addEventListener('click', () => {
    toggleSelection(2, alButton);
	});

	// Adăugăm event listener pentru butonul home
    homeButton.addEventListener('click', () => {
        window.location.href = 'interfata.html';
    });
    // Adăugăm event listener pentru butonul de calculare
    calculateButton.addEventListener('click', () => {
        // Verificăm dacă s-a selectat un metal și s-a introdus o valoare pentru aria
        if (selectedOptions.length === 0) {
            alert('Vă rugăm să selectați un metal.');
            return;
        }
		if (!areaInput.value.trim()) {
            alert('Vă rugăm să introduceți o valoare pentru arie (cm²).');
            return;
		}
        if (!/^\d+(\.\d+)?$/.test(areaInput.value.trim())) {
            alert('Vă rugăm să introduceți o valoare numerică pentru arie (cm²).');
            return;
        }

        area = parseFloat(areaInput.value);

        // Calculăm Ip
		const option = selectedOptions[0];
        const Ip = calculateIp(option, area);
        const stabilityMessage = getStabilityMessage(Ip, metalNames[option]);
        resultDiv.innerHTML = `Indicele de penetrație (Ip) este: ${Ip.toFixed(6)} mm/an.<br>${stabilityMessage}`;
    });

    // Adăugăm event listener pentru butonul de reset
    resetButton.addEventListener('click', () => {
        selectedOptions = [];
        areaInput.value = '';
        resultDiv.textContent = '';
        clearButtons();
        updateSelectionText();
    });
	
	function toggleSelection(option, button){
		if (selectedOptions.includes(option)) {
            selectedOptions = selectedOptions.filter(opt => opt !== option);
            button.classList.remove('selected');
        } else if (selectedOptions.length < 2) {
            selectedOptions.push(option);
            button.classList.add('selected');
        } else {
            alert('Puteți selecta doar două metale.');
        }
		updateSelectionText();
    }
	
	// Funcție pentru actualizarea textului de selecție
    function updateSelectionText() {
        const metalNames = ['Fier', 'Cupru', 'Nichel'];
        if (selectedOptions.length === 0) {
            metalSelection.textContent = 'Selectați metalul:';
        } else {
            metalSelection.textContent = 'Ați selectat: ' + selectedOptions.map(opt => metalNames[opt]).join(' și ');
        }
    }
    // Funcție pentru ștergerea selecției butoanelor
    function clearButtons() {
        feButton.classList.remove('selected');
        cuButton.classList.remove('selected');
        alButton.classList.remove('selected');
    }

    // Funcție pentru calcularea Ip
    function calculateIp(option, area) {
        const metals = [
            { z: 2, A: 56, dens: 7.874 }, // Fier
            { z: 2, A: 64, dens: 8.96 },  // Cupru
            { z: 2, A: 59, dens: 8.9 }     // Nichel
        ];

        const INTENSITATE = 1.5873;
        const FARADAY = 96500;

        const m = metals[option];
        const Kg = (3600 * m.A * INTENSITATE) / (m.z * FARADAY * area) * 10;
        const Ip = (Kg * 24 * 365) / (1000 * m.dens);

        return Ip;
    }

	
    // Funcție pentru determinarea mesajului de stabilitate
    function getStabilityMessage(Ip, metalName) {
        if (Ip < 0.001) {
            return `${metalName} este perfect stabil la coroziune!`;
        } else if (Ip >= 0.001 && Ip <= 0.01) {
            return `${metalName} este foarte stabil la coroziune!`;
        } else if (Ip > 0.01 && Ip <= 0.1) {
            return `${metalName} este stabil la coroziune!`;
        } else if (Ip > 0.1 && Ip <= 1) {
            return `${metalName} este relativ stabil la coroziune!`;
        } else if (Ip > 1 && Ip <= 10) {
            return `${metalName} este puțin stabil la coroziune!`;
        } else if (Ip > 10) {
            return `${metalName} este instabil la coroziune!`;
        }
    }
});
