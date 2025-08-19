document.addEventListener('DOMContentLoaded', function() {
    // --- Script para Vista Previa de Imagen --- 
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');

    if (imageUpload) {
        imageUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- Script para Confeti --- 
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let confettiParticles = [];
        const colors = ['#E83E8C', '#FD7E14', '#20C997', '#0D6EFD', '#6F42C1'];
        const totalConfettis = 100;

        function Confetti() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -canvas.height;
            this.r = Math.random() * 5 + 2; // radius
            this.d = Math.random() * totalConfettis; // density
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.tilt = Math.floor(Math.random() * 10) - 10;
            this.tiltAngleIncremental = Math.random() * 0.07 + 0.05;
            this.tiltAngle = 0;

            this.draw = function() {
                ctx.beginPath();
                ctx.lineWidth = this.r;
                ctx.strokeStyle = this.color;
                ctx.moveTo(this.x + this.tilt + this.r / 4, this.y);
                ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.r / 4);
                return ctx.stroke();
            }
        }

        function update() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (var i = 0; i < confettiParticles.length; i++) {
                var p = confettiParticles[i];
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.tilt = Math.sin(p.tiltAngle - (i / 3)) * 15;

                if (p.y > canvas.height) {
                    confettiParticles[i] = new Confetti();
                    confettiParticles[i].y = -20;
                }
                p.draw();
            }
            requestAnimationFrame(update);
        }

        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        // Initial population
        for (var i = 0; i < totalConfettis; i++) {
            confettiParticles.push(new Confetti());
        }

        update();
    }

    // --- Script para Formulario de Cotización a WhatsApp ---
    const quotationForm = document.querySelector('#cotizar form'); // Selecciona el formulario dentro de la sección #cotizar
    if (quotationForm) {
        quotationForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita el envío normal del formulario

            const name = document.getElementById('userName').value;
            const whatsappNumber = document.getElementById('userWhatsapp').value;
            const size = document.getElementById('pinataSize').value;
            const type = document.getElementById('pinataType').value;
            const details = document.getElementById('pinataDetails').value;

            // Validate required fields
            if (!name || !whatsappNumber || !size || !type) {
                alert('Por favor, completa todos los campos obligatorios (Nombre, Número de WhatsApp, Tamaño y Tipo de piñata).');
                return; // Stop execution if validation fails
            }

            let whatsappMessage = `¡Hola! Me gustaría cotizar una piñata con la siguiente información:\n\n` +
                                    `Nombre: ${name}\n` +
                                    `Número de WhatsApp: ${whatsappNumber}\n` +
                                    `Tamaño: ${size}\n` +
                                    `Tipo: ${type}\n`;

            // Add details only if provided
            if (details) {
                whatsappMessage += `Detalles: ${details}\n\n`;
            }

            

            // Send data to backend
            fetch('https://andyssmash-backend.onrender.com/api/quotations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    whatsappNumber: whatsappNumber,
                    size: size,
                    type: type,
                    details: details
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('¡Cotización enviada y guardada con éxito!');
                // Open WhatsApp URL after successful submission to DB
                const whatsappURL = `https://wa.me/527226008099?text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappURL, '_blank');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Hubo un error al enviar la cotización. Por favor, inténtalo de nuevo.');
            });
        });
    }

    // Inicializar AOS
    AOS.init();
});