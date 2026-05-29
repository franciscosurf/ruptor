import React, { useEffect, useState } from 'react';
import { colors } from '../../styles/colors';

export function LoadingSpinner2222() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '60px',
      gap: 16
    }}>
      <div style={{
        width: 40, height: 40,
        border: `2px solid ${colors.borderDark}`,
        borderTopColor: colors.primary,
        borderRadius: '50%',
        animation: 'spin 0.6s cubic-bezier(0.4, 0, 0.2, 1) infinite'
      }} />
      <span style={{ color: colors.textMuted, fontSize: 14 }}>Analizando tu CV...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}


const steps = [
  'Analizando contenido',
  'Evaluando ATS',
  'Detectando fortalezas',
  'Generando mejoras'
];

export function LoadingSpinner() {
  const [progress, setProgress] = useState(8);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev >= 100 ? 8 : prev + 1;

        if (next < 30) setActiveStep(0);
        else if (next < 55) setActiveStep(1);
        else if (next < 80) setActiveStep(2);
        else setActiveStep(3);

        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div style={styles.wrapper}>
        <div style={styles.card}>

          {/* Glow Background */}
          <div style={styles.glow} />

          {/* Illustration */}
          <div style={styles.illustration}>

            {/* Bars */}
            <div style={styles.bars}>
              {[24, 48, 72, 100].map((h, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.bar,
                    height: h,
                    animationDelay: `${i * 0.12}s`
                  }}
                />
              ))}
            </div>

            {/* Document */}
            <div style={styles.doc}>
              <div style={styles.avatar} />

              <div style={{ ...styles.line, width: 70, marginTop: -44, marginLeft: 72 }} />
              <div style={{ ...styles.line, width: 90 }} />
              <div style={{ ...styles.line, width: 110 }} />
              <div style={{ ...styles.line, width: 80 }} />
            </div>

            {/* Magnifier */}
            <div style={styles.magnifier}>
              <div style={styles.check} />
            </div>

            {/* Sparkles */}
            <div style={{ ...styles.spark, top: 16, right: 22 }} />
            <div style={{ ...styles.spark, top: 62, left: 8, width: 8, height: 8 }} />

          </div>

          {/* Title */}
          <h2 style={styles.title}>
            Analizando tu CV...
          </h2>

          <p style={styles.subtitle}>
            Revisamos experiencia, habilidades y keywords
            para optimizar tu CV para ATS y entrevistas.
          </p>

          {/* Steps */}
          <div style={styles.stepsContainer}>
            {steps.map((step, i) => (
              <div key={i} style={styles.step}>
                <div
                  style={{
                    ...styles.stepCircle,
                    ...(i <= activeStep ? styles.stepCircleActive : {})
                  }}
                >
                  {i + 1}
                </div>

                <span
                  style={{
                    ...styles.stepLabel,
                    color: i <= activeStep
                      ? colors.text
                      : colors.textMuted
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div style={styles.progressWrapper}>

            <div style={styles.progressHeader}>
              <span>Procesando CV</span>
              <span>{progress}%</span>
            </div>

            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${progress}%`
                }}
              />
            </div>

          </div>

        </div>
      </div>

      <style>
        {`
          @keyframes bars {
            0%,100% {
              transform: scaleY(.85);
              opacity: .7;
            }
            50% {
              transform: scaleY(1);
              opacity: 1;
            }
          }

          @keyframes float {
            0%,100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          @keyframes gradient {
            0% {
              background-position: 0% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          @keyframes sparkle {
            0%,100% {
              opacity: .3;
              transform: scale(.8) rotate(45deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.2) rotate(45deg);
            }
          }
        `}
      </style>
    </>
  );
}

const styles = {

  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },

  card: {
    width: '100%',
    maxWidth: 920,
    background: colors.background,
    border: `1px solid ${colors.borderDark}`,
    borderRadius: 28,
    padding: '56px 48px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 10px 40px rgba(0,0,0,.04)'
  },

  glow: {
    position: 'absolute',
    width: 420,
    height: 420,
    background: `${colors.primary}10`,
    borderRadius: '50%',
    top: -180,
    right: -140,
    filter: 'blur(10px)'
  },

  illustration: {
    position: 'relative',
    width: 220,
    height: 210,
    marginBottom: 20
  },

  bars: {
    position: 'absolute',
    left: 0,
    bottom: 20,
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8
  },

  bar: {
    width: 14,
    borderRadius: '10px 10px 0 0',
    background: `linear-gradient(180deg, ${colors.primaryLight}, ${colors.primary})`,
    animation: 'bars 1.3s ease-in-out infinite'
  },

  doc: {
    width: 150,
    height: 190,
    background: '#fff',
    border: `2px solid ${colors.borderDark}`,
    borderRadius: 24,
    position: 'absolute',
    left: 36,
    top: 0,
    boxShadow: '0 12px 30px rgba(124,77,255,.10)'
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    margin: 18,
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`
  },

  line: {
    height: 10,
    borderRadius: 10,
    background: `${colors.primary}18`,
    marginTop: 14,
    marginLeft: 18
  },

  magnifier: {
    width: 95,
    height: 95,
    borderRadius: '50%',
    border: `8px solid ${colors.primary}`,
    background: '#fff',
    position: 'absolute',
    right: 0,
    top: 72,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'float 3s ease-in-out infinite',
    boxShadow: '0 12px 30px rgba(124,77,255,.25)'
  },

  check: {
    width: 30,
    height: 14,
    borderLeft: '6px solid #43d38b',
    borderBottom: '6px solid #43d38b',
    transform: 'rotate(-45deg)',
    marginTop: -4
  },

  spark: {
    position: 'absolute',
    width: 10,
    height: 10,
    background: colors.primary,
    transform: 'rotate(45deg)',
    animation: 'sparkle 2s infinite'
  },

  title: {
    fontSize: 40,
    fontWeight: 700,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center'
  },

  subtitle: {
    fontSize: 18,
    lineHeight: 1.6,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 620,
    marginBottom: 42
  },

  stepsContainer: {
    width: '100%',
    maxWidth: 760,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 40,
    flexWrap: 'wrap'
  },

  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 130
  },

  stepCircle: {
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: `2px solid ${colors.borderDark}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textMuted,
    fontWeight: 700,
    background: '#fff',
    transition: '.3s'
  },

  stepCircleActive: {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
    color: '#fff',
    border: 'none',
    boxShadow: '0 10px 20px rgba(124,77,255,.25)'
  },

  stepLabel: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 1.4,
    fontWeight: 500
  },

  progressWrapper: {
    width: '100%',
    maxWidth: 720
  },

  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 600,
    color: colors.primary
  },

  progressTrack: {
    width: '100%',
    height: 16,
    background: `${colors.primary}12`,
    borderRadius: 999,
    overflow: 'hidden'
  },

  progressBar: {
    height: '100%',
    borderRadius: 999,
    background: `
      linear-gradient(
        90deg,
        ${colors.primary},
        ${colors.primaryLight},
        ${colors.primary}
      )
    `,
    backgroundSize: '200% 100%',
    transition: 'width .2s linear',
    animation: 'gradient 2s linear infinite'
  }
};