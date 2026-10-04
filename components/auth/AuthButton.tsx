import React from "react";
import { Button, ButtonProps, ButtonVariant } from "../Button";

export type AuthButtonProps = ButtonProps;

export const AuthButton: React.FC<AuthButtonProps> = (props) => {
  return <Button {...props} />;
};

export { ButtonVariant };
