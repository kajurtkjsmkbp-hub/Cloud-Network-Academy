import { redirect } from "next/navigation";

export default function Home() {
  // Langsung arahkan (redirect) pengguna ke halaman login
  redirect("/login");
}
