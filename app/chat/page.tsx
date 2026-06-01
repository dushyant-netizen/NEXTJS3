import AppLayout from '../components/AppLayout'; // Adjust path
import ChatPage from '../../src/_root/pages/ChatPage'; // Your custom chat UI

// app/chat/page.tsx

export default function Page() {
  return (
    // Ensure the container of your page has the correct padding to account for the sidebar
    <div className="pl-[110px] w-full h-screen"> {/* Adjust 240px to your sidebar width */}
      <AppLayout>
        <ChatPage />
      </AppLayout>
    </div>
  );
}