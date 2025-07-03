import { Request, Response } from "express";
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const verifyEmail: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const generateLoginOTP: (req: Request, res: Response) => Promise<void>;
export declare const verifyLoginOTP: (req: Request, res: Response) => Promise<void>;
export declare const googleLogin: (req: Request, res: Response) => Promise<void>;
export declare const linkGoogle: (req: Request, res: Response) => Promise<void>;
export declare const unlinkGoogle: (req: Request, res: Response) => Promise<void>;
export declare const requestPasswordResetController: (req: Request, res: Response) => Promise<void>;
export declare const verifyPasswordResetController: (req: Request, res: Response) => Promise<void>;
export declare const resetPasswordController: (req: Request, res: Response) => Promise<void>;
export declare const changePasswordController: (req: Request, res: Response) => Promise<void>;
export declare const resendOTPController: (req: Request, res: Response) => Promise<void>;
export declare const logout: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authcontroler.d.ts.map