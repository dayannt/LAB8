import { supabase } from '../services/supabaseClient';

class MemeGallery extends HTMLElement {
	private offset = 0;
	private limit = 8;
	private observer!: IntersectionObserver;
	private sentinel!: HTMLElement;
	private loading = false;

	connectedCallback() {
		this.render();
		this.loadMemes();
		this.setupInfiniteScroll();

		document.addEventListener('memeUploaded', (e: any) => {
			const filePath = e.detail?.filePath;
			if (filePath) {
				this.loadMemes(true, filePath);
			}
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	private async loadMemes(prepend = false, newFilePath?: string) {
		if (this.loading) return;
		this.loading = true;

		const grid = this.querySelector('.grid');
		if (!grid) return;

		let files = [];
		if (prepend && newFilePath) {
			files = [{ name: newFilePath }];
		} else {
			const { data, error } = await supabase.storage.from('memes').list('', {
				limit: this.limit,
				offset: this.offset,
				sortBy: { column: 'created_at', order: 'desc' },
			});

			if (error || !data || data.length === 0) {
				console.warn('Tu meme ha sido subido exitosamente');

				const defaultMemes = [
					{
						publicUrl: 'https://i.ytimg.com/vi/1kVE-7kNroY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCfnU-7IQXY2TlVGuMCbS_NvEuhFA',
						type: 'image',
					},
					{
						publicUrl: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fopen.spotify.com%2Fplaylist%2F3bSNJvgR7hmrULkIUix2nl&psig=AOvVaw2TgoSn4t96b1VJT4rPHxmV&ust=1749351429970000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCICPi5Ko3o0DFQAAAAAdAAAAABAX',
						type: 'image',
					},
					{
						publicUrl: 'https://images3.memedroid.com/images/UPLOADED184/613a464642177.jpeg',
						type: 'image',
					},
					{
						publicUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZyvAQu57cDeHp2H6h0sPokbJgJVKb8YeSeg&s',
						type: 'image',
					},
					{
						publicUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTD3Q_cLHI5im9dX8Zqy5wwVIeKm3r5lgkhTw&s',
						type: 'image',
					},
					{
						publicUrl: 'https://images3.memedroid.com/images/UPLOADED610/60b65f5d2bddc.jpeg',
						type: 'image',
					},
					{
						publicUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfCThKccGexlq9uO8jslzhuCDG4SJXfUl2-A&s',
						type: 'image',
					},
					{
						publicUrl: 'https://i.pinimg.com/736x/10/2f/ab/102fab218eaa0d0005bf72ea59dc2066.jpg',
						type: 'image',
					},
					{
						publicUrl: 'https://i.pinimg.com/236x/8d/69/58/8d6958c5c2be2c167de03b6e908c7f4c.jpg',
						type: 'image',
					},
					{
						publicUrl: 'https://us-tuna-sounds-images.voicemod.net/0de82678-072e-4725-97aa-b3b0ff678f41-1704764002539.jpg',
						type: 'video',
					},
				];

				for (const meme of defaultMemes) {
					const card = document.createElement('meme-card');
					card.setAttribute('src', meme.publicUrl);
					card.setAttribute('type', meme.type);
					grid.appendChild(card);
				}

				this.loading = false;
				return;
			}

			files = data;
			this.offset += this.limit;
		}

		for (const file of files) {
			const { data } = await supabase.storage.from('memes').getPublicUrl(file.name);
			if (!data?.publicUrl) continue;

			const card = document.createElement('meme-card');
			const ext = file.name.split('.').pop()?.toLowerCase();
			const isVideo = ext === 'mp4' || ext === 'webm' || ext === 'mov';

			card.setAttribute('src', data.publicUrl);
			card.setAttribute('type', isVideo ? 'video' : 'image');

			if (prepend) {
				grid.prepend(card);
			} else {
				grid.appendChild(card);
			}
		}

		this.loading = false;
	}

	private setupInfiniteScroll() {
		this.sentinel = this.querySelector('.sentinel') as HTMLElement;
		if (!this.sentinel) return;

		this.observer = new IntersectionObserver(async (entries) => {
			if (entries[0].isIntersecting && !this.loading) {
				await this.loadMemes();
			}
		});

		this.observer.observe(this.sentinel);
	}

	render() {
		this.innerHTML = `
    <style>
      :host {
        display: block;
        background-color: #121212;
        color: #fff;
        min-height: 100vh;
      }

      .container {
        padding: 0 2rem;
      }

      h2 {
        font-size: 1.5rem;
        margin: 1rem 0;
        color: #fff;
      }

      .grid {
        columns: 250px;
        column-gap: 1rem;
      }

      meme-card {
        break-inside: avoid;
        margin-bottom: 1rem;
        display: block;
      }

      .sentinel {
        height: 1px;
      }
    </style>

    <div class="container">
      <h2>Meme Gallery</h2>
      <div class="grid"></div>
      <div class="sentinel"></div>
    </div>
  `;
	}
}

customElements.define('meme-gallery', MemeGallery);
