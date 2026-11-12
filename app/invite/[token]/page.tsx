import DirectInviteForm from "../DirectInviteForm";

export default async function InvitationPage({params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 return <DirectInviteForm token={token} />;
}
