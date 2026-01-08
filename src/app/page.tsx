"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

// Falling Leaf Component
function FallingLeaf({ delay, startX, duration }: { delay: number; startX: number; duration: number }) {
  return (
    <motion.div
      className="absolute w-6 h-6 text-primary/40"
      style={{ left: `${startX}%`, top: -20 }}
      animate={{
        y: ["0vh", "110vh"],
        x: [0, Math.sin(delay * 10) * 50, Math.sin(delay * 5) * -30, 0],
        rotate: [0, 360, 720],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M17 8c-4 0-7 3-7 7 0 1 .2 2 .5 3M17 8c0 4-3 7-7 7" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M17 8l-2 2M12 18V9" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
}

// Wind Breeze Line Component
function BreezeLine({ delay, y }: { delay: number; y: number }) {
  return (
    <motion.div
      className="absolute h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      style={{ top: `${y}%`, left: 0, right: 0 }}
      animate={{
        x: ["-100%", "200%"],
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
}

// Feature Card with directional hover and lightning effect
function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ x: mousePosition.x, y: mousePosition.y, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setMousePosition({ x: 0, y: 0 }); setIsHovered(false); }}
      className="relative group cursor-pointer"
    >
      <div className="relative p-12 rounded-3xl border border-primary/20 bg-white/60 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden min-h-[320px]">
        {/* Lightning/Thunder effect on hover */}
        {isHovered && (
          <>
            {/* Lightning bolt lines */}
            <motion.div
              className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-primary via-primary/80 to-transparent"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <motion.div
              className="absolute top-0 right-1/3 w-0.5 h-3/4 bg-gradient-to-b from-primary/80 via-primary/60 to-transparent"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: [0, 0.8, 0], scaleY: [0, 1, 0] }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            />
            {/* Flash glow effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{ boxShadow: '0 0 60px rgba(16, 185, 129, 0.4), inset 0 0 30px rgba(16, 185, 129, 0.1)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.3] }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Electric sparks */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}

        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-3xl border-2 border-primary/40" />
        </div>

        <div className="relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 flex items-center justify-center mb-8 transition-all duration-300 shadow-lg group-hover:shadow-primary/40">
            {icon}
          </div>
          <h3 className="text-3xl font-bold text-foreground mb-4">{title}</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Step Component for How It Works
function WorkStep({ number, title, description, isActive }: { number: number; title: string; description: string; isActive: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -20 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="flex items-start gap-12">
        <div className="relative flex-shrink-0">
          <motion.div
            className="w-28 h-28 rounded-full bg-primary flex items-center justify-center shadow-2xl shadow-primary/40"
            animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 1, repeat: isActive ? Infinity : 0, repeatDelay: 2 }}
          >
            <span className="text-5xl font-bold text-white">{number}</span>
          </motion.div>
          {/* Particle effects */}
          {isActive && [...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-primary"
              style={{ top: '50%', left: '50%' }}
              animate={{
                y: [0, -120],
                x: [(i - 2) * 25, (i - 2) * 40],
                opacity: [1, 0],
                scale: [1, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
        <div className="flex-1 pt-4">
          <h3 className="text-5xl font-bold text-foreground mb-6">{title}</h3>
          <p className="text-2xl text-muted-foreground leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: howItWorksRef,
    offset: ["start end", "end start"]
  });

  const currentStep = useTransform(scrollYProgress, [0.1, 0.35, 0.55, 0.75], [1, 2, 3, 4]);

  // Generate leaves with random properties
  const leaves = [...Array(15)].map((_, i) => ({
    delay: i * 0.8,
    startX: Math.random() * 100,
    duration: 8 + Math.random() * 6,
  }));

  // Generate breeze lines
  const breezeLines = [...Array(6)].map((_, i) => ({
    delay: i * 0.7,
    y: 15 + i * 15,
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-40 pb-32 overflow-hidden min-h-screen flex items-center justify-center">
        {/* Background Effects Container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Falling Leaves */}
          {leaves.map((leaf, i) => (
            <FallingLeaf key={i} {...leaf} />
          ))}

          {/* Wind Breeze Lines */}
          {breezeLines.map((line, i) => (
            <BreezeLine key={i} {...line} />
          ))}

          {/* Revolving Earth Background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] opacity-10"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="100" cy="100" r="95" stroke="#10B981" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="80" fill="#10B981" opacity="0.3" />
                <circle cx="100" cy="100" r="70" fill="#10B981" opacity="0.5" />
                <path d="M60 70 Q80 50 110 65 L100 90 L75 85 Z" fill="#059669" opacity="0.8" />
                <path d="M120 60 Q140 55 150 80 L135 100 L115 85 Z" fill="#059669" opacity="0.8" />
                <path d="M50 100 Q70 90 90 105 L80 130 L55 120 Z" fill="#059669" opacity="0.8" />
                <path d="M100 130 Q130 125 145 145 L125 155 L105 145 Z" fill="#059669" opacity="0.8" />
              </svg>
            </motion.div>
          </div>

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-bold text-foreground mb-8 max-w-5xl leading-tight"
          >
            Track Your Carbon Footprint,{" "}
            <span className="text-primary">Together</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl"
          >
            Join communities, participate in sustainability challenges, and make a real impact on the environment through collective action.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-3 h-16 px-12 rounded-full bg-primary text-primary-foreground text-lg font-bold transition-all duration-200 hover:bg-primary/90 hover:scale-105 shadow-xl shadow-primary/20"
            >
              Let's Make This World a Better Place
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tools to measure, manage, and minimize your environmental impact for a sustainable future
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            delay={0}
            icon={
              <svg className="w-12 h-12 text-primary group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Track Activities"
            description="Log daily activities and monitor carbon emissions across transportation, energy consumption, diet choices, and everyday habits with our intuitive tracking system."
          />

          <FeatureCard
            delay={0.1}
            icon={
              <svg className="w-12 h-12 text-primary group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Join Communities"
            description="Connect with neighbors, colleagues, and like-minded individuals for collective impact. Share tips, celebrate wins, and motivate each other towards greener living."
          />

          <FeatureCard
            delay={0.2}
            icon={
              <svg className="w-12 h-12 text-primary group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Complete Challenges"
            description="Participate in community challenges, earn rewards and badges, and compete for positive change. Every action counts towards building a sustainable future together."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="relative mx-auto max-w-7xl px-6 py-20">
        {/* Sticky Header */}
        <div className="sticky top-20 z-20 bg-white/95 backdrop-blur-sm py-12 mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
              Join the movement towards sustainability in four simple steps and be part of the solution for a greener tomorrow
            </p>
          </motion.div>
        </div>

        {/* Falling green breeze animation on scroll */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                left: `${10 + (i % 4) * 25}%`,
                background: 'linear-gradient(135deg, #10B981, #059669)',
              }}
              animate={{
                y: ["0vh", "200vh"],
                opacity: [0, 0.7, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Steps Container - Centered */}
        <div className="max-w-3xl mx-auto space-y-32 relative pt-8 min-h-[180vh]">

          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0.05, 0.15, 0.3], [0, 1, 1]) }}
          >
            <WorkStep
              number={1}
              title="Sign Up"
              description="Create your free account in seconds and join thousands of eco-conscious individuals who are already making a real difference in their communities and beyond."
              isActive={true}
            />
          </motion.div>

          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0.25, 0.35, 0.5], [0, 1, 1]) }}
          >
            <WorkStep
              number={2}
              title="Track"
              description="Log your daily activities with our intuitive interface. Monitor your carbon footprint in real-time across transportation, energy usage, food choices, and shopping habits."
              isActive={true}
            />
          </motion.div>

          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0.45, 0.55, 0.7], [0, 1, 1]) }}
          >
            <WorkStep
              number={3}
              title="Connect"
              description="Join vibrant communities of like-minded individuals. Participate in exciting challenges, share your progress, and compete in friendly leaderboards with your neighbors and friends."
              isActive={true}
            />
          </motion.div>

          <motion.div
            style={{ opacity: useTransform(scrollYProgress, [0.65, 0.75, 0.9], [0, 1, 1]) }}
          >
            <WorkStep
              number={4}
              title="Impact"
              description="Watch your collective impact grow exponentially. Visualize the real-world difference you're making together through beautiful dashboards, milestones, and community achievements."
              isActive={true}
            />
          </motion.div>
        </div>
      </section>

      {/* Sponsor Slider Section with Curved Layout */}
      <section className="relative mx-auto max-w-7xl px-6 py-40 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Trusted By Leaders
          </h2>
          <p className="text-xl text-muted-foreground">
            Organizations committed to carbon neutrality
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center justify-center h-[500px]">
          {/* Top Curved Slider */}
          <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden">
            <div className="relative w-full h-full" style={{ transform: 'perspective(1000px) rotateX(15deg)', transformOrigin: 'center bottom' }}>
              <motion.div
                animate={{ x: [0, -1500] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute flex gap-8 whitespace-nowrap"
              >
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/70 backdrop-blur-xl border border-primary/20 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl">{['🌱', '🌍', '♻️', '🌿'][i % 4]}</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {['EcoVenture', 'GreenTech', 'CarbonZero', 'EarthFirst', 'CleanAir Co', 'SolarWave', 'BioPower', 'NatureCore'][i % 8]}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Revolving Earth in Center */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="relative z-10 w-56 h-56 md:w-72 md:h-72"
          >
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-2xl">
              {/* Outer glow */}
              <circle cx="100" cy="100" r="98" stroke="#10B981" strokeWidth="1" opacity="0.3" />
              <circle cx="100" cy="100" r="94" stroke="#10B981" strokeWidth="0.5" opacity="0.2" />

              {/* Earth base */}
              <circle cx="100" cy="100" r="85" fill="url(#earthGradient)" />

              {/* Continents */}
              <path d="M55 65 Q75 45 100 55 L95 80 L65 75 Z" fill="#059669" />
              <path d="M110 50 Q135 45 150 70 L140 95 L115 80 Z" fill="#059669" />
              <path d="M45 95 Q65 85 85 100 L75 130 L50 120 Z" fill="#059669" />
              <path d="M105 120 Q135 115 150 135 L130 150 L110 140 Z" fill="#059669" />
              <path d="M130 90 Q145 100 140 120 L125 115 Z" fill="#047857" />

              {/* Highlight */}
              <ellipse cx="75" cy="75" rx="25" ry="20" fill="white" opacity="0.15" />

              <defs>
                <radialGradient id="earthGradient" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#059669" />
                </radialGradient>
              </defs>
            </svg>

            {/* Orbiting elements */}
            <motion.div
              className="absolute w-full h-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-primary rounded-full shadow-lg" />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary/70 rounded-full shadow-lg" />
            </motion.div>
          </motion.div>

          {/* Bottom Curved Slider */}
          <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
            <div className="relative w-full h-full" style={{ transform: 'perspective(1000px) rotateX(-15deg)', transformOrigin: 'center top' }}>
              <motion.div
                animate={{ x: [-1500, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute flex gap-8 whitespace-nowrap"
              >
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/70 backdrop-blur-xl border border-primary/20 shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl">{['🌲', '💧', '⚡', '🌻'][i % 4]}</span>
                    </div>
                    <span className="text-lg font-semibold text-foreground">
                      {['TreePlant', 'AquaPure', 'WindFlow', 'SunHarvest', 'OceanSave', 'ForestGuard', 'EcoMate', 'GreenPath'][i % 8]}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-8">
            Ready to Make a Difference?
          </h2>
          <p className="text-2xl text-muted-foreground mb-16">
            Join communities working together to create a sustainable future for generations to come
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-3 h-16 px-12 rounded-full bg-primary text-primary-foreground text-lg font-bold transition-all duration-200 hover:bg-primary/90 hover:scale-105 shadow-xl shadow-primary/20"
          >
            Let's Make the Earth Clean
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="currentColor" opacity="0.15" />
                <path d="M17 8c-4 0-7 3-7 7 0 1 .2 2 .5 3M17 8c0 4-3 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M17 8l-2 2M12 18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>EcoMate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering communities for a sustainable future
            </p>
            <p className="text-xs text-muted-foreground">
              © 2026 EcoMate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
