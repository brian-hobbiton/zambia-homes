import ChatInterface from "./chat-interface";
import SiteHeader from "@/components/layout/site-header";

export default function MessagingPage() {
    return (
        <div className="flex flex-col h-screen bg-background">
            <SiteHeader />
            <main className="flex-1 overflow-hidden">
                <ChatInterface />
            </main>
        </div>
    );
}
