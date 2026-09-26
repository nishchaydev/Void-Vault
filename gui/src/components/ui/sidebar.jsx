"use client";

import { cn } from "../../lib/utils";
import { Link, useLocation } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(true);
  const [isPinned, setIsPinned] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ 
      open, 
      setOpen, 
      animate, 
      isPinned, 
      setIsPinned, 
      isHidden, 
      setIsHidden 
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate = true,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen, animate, isPinned, isHidden } = useSidebar();

  const handleMouseEnter = () => {
    if (!isPinned && !isHidden) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned && !isHidden) {
      setOpen(false);
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "h-full px-3 py-4 hidden md:flex md:flex-col bg-white/80 backdrop-blur-md border-r border-[#d3cec6] flex-shrink-0 z-30 shadow-sm overflow-x-hidden select-none",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "68px") : "260px",
      }}
      transition={{
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(
        "h-12 px-4 flex flex-row md:hidden items-center justify-between bg-white/80 backdrop-blur-md border-b border-[#d3cec6] w-full"
      )}
      {...props}
    >
      <div className="flex justify-end z-20 w-full">
        <Menu
          className="text-neutral-800 cursor-pointer w-5 h-5"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed h-full w-full inset-0 bg-white/95 backdrop-blur-lg p-6 z-[100] flex flex-col justify-between border-r border-[#d3cec6]",
              className
            )}
          >
            <div
              className="absolute right-6 top-6 z-50 text-neutral-800 cursor-pointer p-1"
              onClick={() => setOpen(!open)}
            >
              <X className="w-5 h-5" />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  active = false,
  badge = null,
  ...props
}) => {
  const { open, animate } = useSidebar();
  const location = useLocation();
  const isActive = active || (link.href && link.href !== '#' && location.pathname === link.href);

  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2 px-2.5 rounded-lg text-xs relative transition-colors duration-150",
        isActive 
          ? "bg-[#111111] text-white font-medium shadow-xs" 
          : "text-[#626260] hover:text-[#111111] hover:bg-black/5",
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
        {link.icon}
      </div>
      <motion.div
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          width: animate ? (open ? "auto" : 0) : "auto",
        }}
        transition={{ 
          duration: 0.2, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden"
      >
        <span className="truncate">{link.label}</span>
        {badge && (
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ml-2",
            isActive ? "bg-white/20 text-white" : "bg-neutral-200 text-neutral-700"
          )}>
            {badge}
          </span>
        )}
      </motion.div>
    </Link>
  );
};
