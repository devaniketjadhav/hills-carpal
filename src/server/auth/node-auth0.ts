import auth0 from 'auth0';

export const managementClient = new auth0.ManagementClient({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: 'EFdG2h9dMZHtfo4aGD3SUZfghxlkED2K',
  clientSecret: 'OaAs6inVjgwbHIxkR2vGKwpmIOb00MhyUQZXtwWaQ6sGa9GjlyhmoWybYo7izXGv',
  scope: 'read:users read:roles read:role_members',
});
