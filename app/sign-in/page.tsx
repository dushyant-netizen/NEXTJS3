'use client';

import { motion } from "framer-motion";
import { QueryProvider } from '../../src/lib/react-query/QueryProvider';
import { AuthProvider } from '../../src/context/SupabaseAuthContext';
import SigninForm from '../../src/_auth/forms/SigninForm';
import { Toaster } from '../../src/components/ui/toaster';

export default function SignInPage() {
  return (
    <QueryProvider>
      <AuthProvider>
        <main className="relative min-h-screen w-full flex bg-neutral-950 overflow-hidden">
          
          {/* Left Side - Form Section */}
          <section className="flex flex-1 flex-col items-center justify-center p-8 lg:p-12 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-[400px] bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
            >
              <SigninForm />
            </motion.div>
          </section>
          
          {/* Right Side - Visual Section */}
          <div className="hidden xl:block relative w-1/2 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-700 hover:scale-100" 
              style={{ backgroundImage: "url('/assets/images/side-img.png')" }} 
            />
            {/* Ambient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent" />
            
            {/* Branding / Tagline Overlay */}
            <div className="absolute bottom-12 left-12 text-white/90">
              <h2 className="text-4xl font-bold tracking-tight">Your workflow, <br /> evolved.</h2>
              <p className="mt-4 text-neutral-400 max-w-sm">Manage, organize, and execute your team's best work in one unified space.</p>
            </div>
          </div>
        </main>
        <Toaster />
      </AuthProvider>
    </QueryProvider>
  );
}