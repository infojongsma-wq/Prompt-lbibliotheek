import PromptForm from '@/components/PromptForm';

export default function NieuwPromptPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Nieuwe Prompt Toevoegen</h1>
        <p className="text-gray-500 mt-1">Vul de onderstaande velden in om een nieuwe prompt op te slaan.</p>
      </div>
      <PromptForm />
    </div>
  );
}
