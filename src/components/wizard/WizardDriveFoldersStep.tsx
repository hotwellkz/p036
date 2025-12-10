import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, FolderPlus, AlertCircle } from "lucide-react";
import { generateDriveFolders } from "../../api/channelDriveFolders";
import { useIntegrationsStatus } from "../../hooks/useIntegrationsStatus";
import { FieldHelpIcon } from "../aiAssistant/FieldHelpIcon";

interface WizardDriveFoldersStepProps {
  channelId: string;
  channelName: string;
  onComplete: (rootFolderId: string, archiveFolderId: string) => void;
}

export function WizardDriveFoldersStep({
  channelId,
  channelName,
  onComplete
}: WizardDriveFoldersStepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);
  const [archiveFolderId, setArchiveFolderId] = useState<string | null>(null);
  const integrationsStatus = useIntegrationsStatus();

  const handleGenerate = async () => {
    if (!integrationsStatus.status.googleDrive.connected) {
      setError("Сначала подключите Google Drive");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateDriveFolders(channelId);

      if (result.success && result.rootFolderId && result.archiveFolderId) {
        setRootFolderId(result.rootFolderId);
        setArchiveFolderId(result.archiveFolderId);
        setSuccess(true);
        
        // Вызываем callback с задержкой для лучшего UX
        setTimeout(() => {
          onComplete(result.rootFolderId!, result.archiveFolderId!);
        }, 1500);
      } else {
        throw new Error(result.message || result.error || "Неизвестная ошибка");
      }
    } catch (error: any) {
      console.error("Failed to generate drive folders:", error);
      
      let errorMessage = "Не удалось создать папки Google Drive";
      
      if (error.message) {
        const errorCode = error.code || error.message;
        const errorText = error.message.toLowerCase();
        
        if (errorCode === "CHANNEL_NOT_FOUND" || errorText.includes("канал не найден")) {
          errorMessage = "Канал не найден. Обновите страницу и попробуйте снова.";
        } else if (errorCode === "GOOGLE_DRIVE_NOT_CONNECTED" || errorText.includes("google_drive_not_connected")) {
          errorMessage = "Сначала подключите Google Drive";
        } else if (errorCode === "INSUFFICIENT_PERMISSIONS" || errorText.includes("insufficient_permissions")) {
          errorMessage = "Ваш аккаунт Google не выдал необходимые разрешения. Переподключите Google Drive.";
        } else {
          errorMessage = error.message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Если Google Drive не подключен, показываем предупреждение
  if (!integrationsStatus.status.googleDrive.connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold md:text-lg">Создание папок для канала</h3>
          <FieldHelpIcon
            fieldKey="wizard.drive_folders"
            page="wizard"
            channelContext={{
              step: "drive_folders",
              context: "wizard",
              channelName
            }}
            label="Создание папок для канала"
          />
        </div>
        <div className="rounded-lg border border-amber-500/30 bg-amber-900/20 p-4">
          <p className="text-sm text-amber-200">
            Для создания папок необходимо подключить Google Drive. Вернитесь к предыдущему шагу и подключите Google Drive.
          </p>
        </div>
      </div>
    );
  }

  // Если папки уже созданы, показываем успешное сообщение
  if (success) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div className="flex-1">
            <div className="font-medium text-white">✅ Папки успешно созданы</div>
            <div className="mt-1 text-sm text-slate-400">
              Основная папка: {channelName}
            </div>
            {rootFolderId && (
              <div className="mt-1 text-xs text-slate-500">
                ID: {rootFolderId}
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-400">Завершаем создание канала...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold md:text-lg">Создание папок для канала</h3>
        <FieldHelpIcon
          fieldKey="wizard.drive_folders"
          page="wizard"
          channelContext={{
            step: "drive_folders",
            context: "wizard",
            channelName
          }}
          label="Создание папок для канала"
        />
      </div>
      <p className="text-xs text-slate-400 md:text-sm">
        Будет создана основная папка канала и подпапка «uploaded». Система назначит необходимые права и автоматически заполнит настройки канала.
      </p>

      {/* Ошибки */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-900/20 p-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div className="flex-1 text-sm text-red-300">{error}</div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Кнопка создания папок */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || integrationsStatus.status.googleDrive.loading}
        className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Создание папок...
          </>
        ) : (
          <>
            <FolderPlus className="h-4 w-4" />
            Создать папки для канала автоматически
          </>
        )}
      </button>
    </div>
  );
}

