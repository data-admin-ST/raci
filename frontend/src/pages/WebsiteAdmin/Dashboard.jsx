const getInitialsAvatar = (name) => {
  const initial = name.charAt(0).toUpperCase();
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="20" font-weight="bold">${initial}</text></svg>`;
};

<img
  src={getInitialsAvatar(company.name)}
  alt={company.name}
  className="w-10 h-10 rounded-full"
/> 