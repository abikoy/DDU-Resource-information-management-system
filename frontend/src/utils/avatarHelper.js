export const getAvatarUrl = (user, previewUrl = null) => {
  if (previewUrl) return previewUrl;
  if (!user?.avatar) return null;
  return user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`;
};
