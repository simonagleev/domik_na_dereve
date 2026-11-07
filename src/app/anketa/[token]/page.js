import AnketaClient from './AnketaClient';

export default async function AnketaPage({ params }) {
  const { token } = await params;
  return <AnketaClient token={token} />;
}
