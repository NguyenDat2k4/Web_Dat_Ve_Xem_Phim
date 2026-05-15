/**
 * lib/ml-recommendation.ts
 * Module chứa các thuật toán Machine Learning thu nhỏ dùng cho Hệ thống Gợi ý Phim.
 */

/**
 * Tính toán độ tương đồng Cosine (Cosine Similarity) giữa 2 vector.
 * Kết quả từ 0 (hoàn toàn khác biệt) đến 1 (hoàn toàn giống nhau).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Chuyển đổi một mảng các thể loại (genres) thành một vector
 * dựa trên danh sách từ vựng (vocabulary) của toàn bộ hệ thống.
 */
export function vectorizeGenres(genres: string[], vocabulary: string[]): number[] {
  return vocabulary.map(vocab => genres.includes(vocab) ? 1 : 0);
}

/**
 * Trích xuất tất cả các thể loại duy nhất (từ vựng) từ tập dữ liệu phim.
 */
export function extractVocabulary(movies: any[]): string[] {
  const vocabulary = new Set<string>();
  movies.forEach(movie => {
    if (movie && movie.genre) {
      // Tách thể loại bằng dấu phẩy và làm sạch chuỗi
      const genres = movie.genre.split(',').map((g: string) => g.trim().toLowerCase());
      genres.forEach((g: string) => vocabulary.add(g));
    }
  });
  return Array.from(vocabulary);
}

/**
 * Lấy danh sách thể loại của một phim.
 */
const getMovieGenres = (movie: any): string[] => {
  if (!movie || !movie.genre) return [];
  return movie.genre.split(',').map((g: string) => g.trim().toLowerCase());
}

/**
 * Thuật toán Content-Based Filtering: Lấy danh sách phim tương tự với phim mục tiêu.
 * Ứng dụng: Block "Có thể bạn sẽ thích" ở trang chi tiết phim.
 */
export function getSimilarMovies(targetMovie: any, allMovies: any[], limit: number = 5): any[] {
  if (!targetMovie || allMovies.length === 0) return [];

  const vocabulary = extractVocabulary([...allMovies, targetMovie]);
  const targetVector = vectorizeGenres(getMovieGenres(targetMovie), vocabulary);

  const scoredMovies = allMovies
    .filter(m => m && m._id && targetMovie && targetMovie._id && m._id.toString() !== targetMovie._id.toString()) // Loại bỏ chính nó
    .map(movie => {
      const vector = vectorizeGenres(getMovieGenres(movie), vocabulary);
      const score = cosineSimilarity(targetVector, vector);
      return { movie, score };
    });

  // Sắp xếp theo điểm tương đồng giảm dần
  scoredMovies.sort((a, b) => b.score - a.score);

  return scoredMovies.slice(0, limit).map(item => item.movie);
}

/**
 * Xây dựng hồ sơ sở thích của User (User Profile Vector)
 * Tính bằng trung bình cộng vector của các phim người dùng đã xem/yêu thích.
 */
export function buildUserProfile(userMovies: any[], vocabulary: string[]): number[] {
  let profileVector = new Array(vocabulary.length).fill(0);
  
  if (userMovies.length === 0) return profileVector;

  userMovies.forEach(movie => {
      const genres = getMovieGenres(movie);
      const vector = vectorizeGenres(genres, vocabulary);
      
      // Cộng gộp vector
      for (let i = 0; i < profileVector.length; i++) {
          profileVector[i] += vector[i];
      }
  });

  // Chuẩn hóa vector thành trung bình
  for (let i = 0; i < profileVector.length; i++) {
      profileVector[i] = profileVector[i] / userMovies.length;
  }

  return profileVector;
}

/**
 * Thuật toán Gợi ý Cá nhân hóa (Personalized Recommendations)
 * So sánh Vector User Profile với Vector của các bộ phim trong DB.
 * Ứng dụng: Block "Gợi ý cho bạn" ở trang chủ.
 */
export function recommendForUser(userMovies: any[], allMovies: any[], limit: number = 10): any[] {
  // Nếu user chưa có lịch sử, fallback về những phim có rating cao nhất
  if (userMovies.length === 0) {
      return allMovies
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);
  }

  const vocabulary = extractVocabulary([...allMovies, ...userMovies]);
  const userProfileVector = buildUserProfile(userMovies, vocabulary);
  const userMovieIds = userMovies
    .filter(m => m && m._id)
    .map(m => m._id.toString());

  const scoredMovies = allMovies
      .filter(m => m && m._id && !userMovieIds.includes(m._id.toString())) // Không gợi ý lại phim đã xem/đã thêm vào watchlist
      .map(movie => {
          const vector = vectorizeGenres(getMovieGenres(movie), vocabulary);
          const score = cosineSimilarity(userProfileVector, vector);
          return { movie, score };
      });

  // Sắp xếp theo điểm tương đồng giảm dần, nếu bằng điểm thì ưu tiên phim có rating cao hơn
  scoredMovies.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (b.movie.rating || 0) - (a.movie.rating || 0);
  });

  return scoredMovies.slice(0, limit).map(item => item.movie);
}
