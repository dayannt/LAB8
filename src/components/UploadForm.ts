import { supabase } from '../services/supabaseClient'

class UploadForm extends HTMLElement {
  private currentObjectURL: string | null = null;

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }

  connectedCallback() {
    const input = this.shadowRoot?.querySelector('input') as HTMLInputElement
    const previewImg = this.shadowRoot?.querySelector('img') as HTMLImageElement
    const previewVideo = this.shadowRoot?.querySelector('video') as HTMLVideoElement
    const form = this.shadowRoot?.querySelector('form') as HTMLFormElement
    const progress = this.shadowRoot?.querySelector('progress') as HTMLProgressElement
    const loader = this.shadowRoot?.querySelector('.loader') as HTMLDivElement
    const submitButton = this.shadowRoot?.querySelector('button[type="submit"]') as HTMLButtonElement

    input?.addEventListener('change', () => {
      const file = input.files?.[0]

      if (this.currentObjectURL) {
        URL.revokeObjectURL(this.currentObjectURL);
        this.currentObjectURL = null;
      }

      if (!file) return
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Sólo se pueden imágenes o videos compa😔')
        return
      }

      if (file.type.startsWith('image/')) {
        this.currentObjectURL = URL.createObjectURL(file);
        previewImg.src = this.currentObjectURL;
        previewImg.style.display = 'block'
        previewVideo.style.display = 'none'
      } else {
        this.currentObjectURL = URL.createObjectURL(file);
        previewVideo.src = this.currentObjectURL;
        previewVideo.style.display = 'block'
        previewImg.style.display = 'none'
      }
    })

    form?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const file = input.files?.[0]
      if (!file) return

      const filePath = `${Date.now()}-${file.name}`
      progress.value = 0
      loader.style.display = 'block'
      if (submitButton) submitButton.disabled = true;

      try {
        const { data, error } = await supabase.storage
          .from('memes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,

          })

        loader.style.display = 'none'
        if (submitButton) submitButton.disabled = false;

        if (error) {
          alert('Error al subir: ' + error.message)
        } else {
          alert('Tu meme está posteado k pro 😎')

          const eventDetail = { detail: { filePath: filePath } };
          document.dispatchEvent(new CustomEvent('memeUploaded', eventDetail));

          input.value = ''
          if (this.currentObjectURL) {
            URL.revokeObjectURL(this.currentObjectURL);
            this.currentObjectURL = null;
          }
          previewImg.src = ''
          previewImg.style.display = 'none'
          previewVideo.src = ''
          previewVideo.style.display = 'none'
          progress.value = 0
        }
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        alert('Error catastrófico al subir el archivo.');
        loader.style.display = 'none';
        if (submitButton) submitButton.disabled = false;
      }
    })
  }

  render() {
    this.shadowRoot!.innerHTML = `
   <style>
      form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        padding: 0.8rem;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        max-width: 100%;
        font-family: 'Press Start 2P', cursive;
      }

      input[type="file"] {
        font-family: 'Press Start 2P', cursive;
        font-size: 0.7rem;
        border: 1px solid #40e0d0;
        padding: 0.3rem;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.1);
        cursor: pointer;
        color: white;
      }

      button[type="submit"] {
        padding: 0.6rem 1rem;
        border: none;
        border-radius: 8px;
        background: #40e0d0;
        color: #fff;
        font-family: 'Press Start 2P', cursive;
        font-size: 0.7rem;
        font-weight: bold;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 0 10px #40e0d0,
                   0 0 20px rgba(64, 224, 208, 0.4);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      button[type="submit"]:hover {
        transform: translateY(-2px);
        background: #ba68c8;
        box-shadow: 0 0 15px #ba68c8,
                   0 0 30px rgba(186, 104, 200, 0.6);
      }

      button[type="submit"]::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: 0.5s;
      }

      button[type="submit"]:hover::before {
        left: 100%;
      }

      progress {
        width: 100%;
        height: 8px;
        border: none;
        border-radius: 4px;
        overflow: hidden;
        background-color: rgba(255, 255, 255, 0.1);
        margin: 0;
        padding: 0;
        appearance: none;
      }
      progress::-webkit-progress-bar {
        background-color: rgba(255, 255, 255, 0.1);
      }
      progress::-webkit-progress-value {
        background-color: #40e0d0;
      }

      .loader {
        display: none;
        width: 32px;
        height: 32px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: #40e0d0;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        align-self: center;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>

      <form>
        <input type="file" accept="image/*,video/*" required />
        <img />
        <video></video>
        <progress value="0" max="100"></progress>
        <div class="loader"></div>
        <button type="submit">Subir Meme</button>
      </form>
    `
  }
}

customElements.define('upload-form', UploadForm)
