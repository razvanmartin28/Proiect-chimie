document.addEventListener('DOMContentLoaded', () => {
    let selectedOptions = [];
    let area = 0;
    let intensity = 0;

    // Selectăm butoanele și caseta de input
    const feButton = document.getElementById('feButton');
    const cuButton = document.getElementById('cuButton');
    const niButton = document.getElementById('niButton');
	const znButton = document.getElementById('znButton');
	const alButton = document.getElementById('alButton');
	const naButton = document.getElementById('naButton');
	const auButton = document.getElementById('auButton');
    const areaInput = document.getElementById('areaInput');
	const intensityInput = document.getElementById('intensityInput');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultDiv = document.getElementById('result');
    const metalSelection = document.getElementById('metalSelection').querySelector('p');
	const homeButton = document.getElementById('homeButton');

    const metalNames = ['Fier', 'Cupru', 'Nichel', 'Zinc', 'Aluminiu', 'Sodiu', 'Aur'];

    // Adăugăm event listener pentru butoanele de metal
    feButton.addEventListener('click', () => {
    toggleSelection(0, feButton);
	});

	cuButton.addEventListener('click', () => {
    toggleSelection(1, cuButton);
	});

	niButton.addEventListener('click', () => {
    toggleSelection(2, niButton);
	});
	
	znButton.addEventListener('click', () => {
    toggleSelection(3, znButton);
	});
	
	alButton.addEventListener('click', () => {
    toggleSelection(4, alButton);
	});
	
	naButton.addEventListener('click', () => {
    toggleSelection(5, naButton);
	});
	
	auButton.addEventListener('click', () => {
    toggleSelection(6, auButton);
	});
	
	// Adăugăm event listener pentru butonul home
    homeButton.addEventListener('click', () => {
        window.location.href = 'interfata.html';
    });
    // Adăugăm event listener pentru butonul de calculare
    calculateButton.addEventListener('click', () => {
        // Verificăm dacă s-a selectat un metal și s-a introdus o valoare pentru aria
        if (selectedOptions.length !== 2) {
            alert('Vă rugăm să selectați două metal.');
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
	
	    if (!intensityInput.value.trim()) {
            alert('Vă rugăm să introduceți o valoare pentru intensitate curentului de dizolvare anodica (A).');
            return;
		}
        if (!/^\d+(\.\d+)?$/.test(intensityInput.value.trim())) {
            alert('Vă rugăm să introduceți o valoare numerică pentru intensitatea curentului de dizolvare anodica (A).');
            return;
        }

        area = parseFloat(areaInput.value);
		intensity = parseFloat(intensityInput.value)
		
        // Calculăm Ip + care din metale e catod si care e anod
        const result = calculateIp(selectedOptions, area, intensity);
		const mesaj = getStabilityMessage(result.Ip, result.anod);
		
		// Afisăm rezultatele
		resultDiv.innerHTML = `
			<p>În pila galvanică formată din ${metalNames[selectedOptions[0]]} si ${metalNames[selectedOptions[1]]}, în mediul neutru de apă de mare,  ${result.anod} este anod și  ${result.catod} este catod.</p>
			<p>Indicele de penetrație (Ip) este: ${result.Ip.toFixed(6)} mm/an. </p>
			<p>${mesaj}</p>
		`;
	});

    // Adăugăm event listener pentru butonul de reset
    resetButton.addEventListener('click', () => {
        selectedOptions = [];
        areaInput.value = '';
	intensityInput.value = '';
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
        const metalNames = ['Fier', 'Cupru', 'Nichel', 'Zinc', 'Aluminiu', 'Sodiu', 'Aur'];
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
        niButton.classList.remove('selected');
		znButton.classList.remove('selected');
		alButton.classList.remove('selected');
		naButton.classList.remove('selected');
		auButton.classList.remove('selected');
    }
	
	
    // Funcție pentru calcularea Ip
    function calculateIp(option, area, intensity) {
        const metals = [
            { name: 'Fierul',     z: 2, A: 56,  dens: 7.874, pot: -0.44 }, // Fier
			{ name: 'Cuprul',    z: 2, A: 64,  dens: 8.96,  pot: 0.34 },  // Cupru
			{ name: 'Nichelul',   z: 2, A: 59,  dens: 8.908, pot: -0.25 }, // Nichel
			{ name: 'Zincul',     z: 2, A: 65,  dens: 7.134,  pot: -0.76 }, // Zinc	 
			{ name: 'Aluminiul', z: 3, A: 27,  dens: 2.70,  pot: -1.66 }, // Aluminiu
			{ name: 'Sodiul',    z: 1, A: 23,  dens: 0.971,  pot: -2.7 }, // Sodiu
			{ name: 'Aurul',      z: 3, A: 197, dens: 19.32, pot: 1.5 }  // Aur
        ];
		
        const FARADAY = 96485.3321;
		
		const m1 = metals[option[0]];
		const m2 = metals[option[1]];
		
		let anod, catod, Kg, Ip;
		//ala cu pot de coroziune mai mic e anod
		if (m1.pot < m2.pot) {
			anod = m1.name;
			catod = m2.name;
			Kg = (3600 * m1.A * intensity) / (m1.z * FARADAY * area) * 10;
			Ip = (Kg * 24 * 365) / (1000 * m1.dens);
		} else {
			anod = m2.name;
			catod = m1.name;
			Kg = (3600 * m2.A * intensity) / (m2.z * FARADAY * area) * 10;
			Ip = (Kg * 24 * 365) / (1000 * m2.dens);
		}
		
		return { Ip, anod, catod};
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
