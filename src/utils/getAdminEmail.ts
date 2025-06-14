import { User } from "../models/User";

export const getEmail = async () => {
  try {
    const superAdmin = await User.findOne({
      where: { role: "super_admin" },
    });
    console.log("detauls", superAdmin,superAdmin?.remarks)
    if (
      superAdmin &&
      superAdmin.remarks &&
      typeof superAdmin.remarks === "object"
    ) {
      return {
        sendingEmail: (superAdmin.remarks as any).email,
        password: (superAdmin.remarks as any).password,
      };
    }

    return null; 
  } catch (error) {
    console.error("Error retrieving super admin sender email:", error);
    throw error;
  }
};
