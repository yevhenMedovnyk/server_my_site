// 🔧 Функція для отримання public_id з Cloudinary URL
export function getPublicIdFromUrl(url) {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname; // /djnunzhqk/image/upload/v1748963923/albums/first_album/yxlydgy862mugwkcfqc2.webp
		const parts = pathname.split('/');

		// знайти індекс 'upload' і взяти все після нього
		const uploadIndex = parts.findIndex(p => p === 'upload');
		if (uploadIndex === -1) return null;

		// візьмемо всі частини шляху після 'upload' + 1 (пропускаємо версію типу v1748963923)
		const publicPathParts = parts.slice(uploadIndex + 2);

		// об'єднуємо їх у публічний ID
		const publicIdWithExt = publicPathParts.join('/');

		// видаляємо розширення .webp/.jpg/.png тощо
		return publicIdWithExt.replace(/\.[^/.]+$/, '');
	} catch (e) {
		return null;
	}
}