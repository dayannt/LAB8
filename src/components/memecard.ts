class MemeCard extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'type'];
  }

  private shadow: ShadowRoot;
  private src = '';
  private type: 'image' | 'video' = 'image';

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  attributeChangedCallback(attrName: string, oldVal: string, newVal: string) {
    if (oldVal === newVal) return;

    if (attrName === 'src') {
      this.src = newVal;
      console.log('MemeCard: URL actualizada -', newVal);
    }
    if (attrName === 'type') this.type = newVal as 'image' | 'video';

    if (this.src && this.type) this.render();
  }

  private handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    console.error('Error cargando imagen:', this.src);
    target.parentElement!.innerHTML = '<div class="error-placeholder">Error al cargar la imagen 😢</div>';
  }

  private handleImageLoad(event: Event) {
    console.log('Imagen cargada exitosamente:', this.src);
  }

  render() {
    this.shadow.innerHTML = `
      <style>
        .card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          position: relative;
          margin-bottom: 1rem;
        }

        .card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          z-index: 10;
        }

        img, video {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          border-radius: 12px;
          min-height: 200px;
          background: rgba(255, 255, 255, 0.05);
        }

        .error-placeholder {
          width: 100%;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          font-family: 'Press Start 2P', cursive;
          font-size: 0.8rem;
          text-align: center;
          padding: 1rem;
          border-radius: 12px;
        }

        .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          border-top-color: #40e0d0;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      </style>
      <div class="card">
        ${this.type === 'video'
          ? `<video src="${this.src}" autoplay muted loop playsinline></video>`
          : `
            <div class="loading"></div>
            <img 
              src="${this.src}" 
              alt="meme" 
              onload="this.parentElement.querySelector('.loading').style.display='none'; this.dispatchEvent(new Event('imageloaded'))"
              onerror="this.parentElement.innerHTML='<div class=\\'error-placeholder\\'>Error al cargar la imagen 😢</div>'"
            />
          `}
      </div>
    `;

    // Agregar event listeners para debugging
    const img = this.shadow.querySelector('img');
    if (img) {
      img.addEventListener('error', this.handleImageError.bind(this));
      img.addEventListener('load', this.handleImageLoad.bind(this));
    }
  }
}

customElements.define('meme-card', MemeCard);
