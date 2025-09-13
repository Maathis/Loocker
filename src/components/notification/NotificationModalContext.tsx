import { createContext, useState, ReactNode } from "react";
import NotificationModal, { NotificationModalType } from "./NotificationModal";

export interface NotificationModalContextProps {
  showModal: (type: NotificationModalType, title: string, message: string) => void;
}

export const ModalContext = createContext<NotificationModalContextProps | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: "success" as NotificationModalType,
    title: "",
    message: "",
  });

  const showModal = (type: NotificationModalType, title: string, message: string) => {
    setModalConfig({ type, title, message });
    setIsOpen(true);
  };

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      <NotificationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        {...modalConfig}
      />
    </ModalContext.Provider>
  );
};