import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Avatar Component - Hand-drawn sketch style character
 *
 * - Parallax depth effect on scroll
 * - Dodges when camera approaches
 * - Waves: the forearm is a separate layer that rotates around the elbow
 *   every frame, so the motion is continuous instead of frame-by-frame.
 */

// Both textures are 1024x1024 and share the same canvas, so they line up exactly.
const BODY_URL = '/textures/corridor/avatar_wave/body.webp';
const FOREARM_URL = '/textures/corridor/avatar_wave/forearm.webp';
const TEX_SIZE = 1024;
const ELBOW_PX = [665, 318]; // elbow pivot in texture pixels

const SIZE = 2.3; // plane width and height (square texture)

// Wave: angle swings between WAVE_MIN and WAVE_MAX degrees (positive = towards the head)
const WAVE_MIN = -4;
const WAVE_MAX = 12;
const WAVE_SPEED = 9; // radians per second (~1.4 waves per second)

// Elbow position in plane coordinates (plane centered on 0,0)
const PIVOT_X = (ELBOW_PX[0] / TEX_SIZE - 0.5) * SIZE;
const PIVOT_Y = (0.5 - ELBOW_PX[1] / TEX_SIZE) * SIZE;

const Avatar = ({ position = [10, -20, 30] }) => {
    const groupRef = useRef();
    const forearmRef = useRef();
    const { camera } = useThree();

    // Dodge state
    const dodgeX = useRef(0);
    const targetDodgeX = useRef(0);
    const worldPosVec = useRef(new THREE.Vector3());

    const [bodyTex, forearmTex] = useTexture([BODY_URL, FOREARM_URL]);

    useEffect(() => {
        bodyTex.colorSpace = THREE.SRGBColorSpace;
        forearmTex.colorSpace = THREE.SRGBColorSpace;
    }, [bodyTex, forearmTex]);

    useFrame((state) => {
        if (!groupRef.current) return;

        // === DODGE LOGIC ===
        groupRef.current.getWorldPosition(worldPosVec.current);
        const distance = camera.position.z - worldPosVec.current.z;

        const DODGE_START = 3;
        const DODGE_PEAK = 0;
        const DODGE_END = -2;
        const DODGE_AMOUNT = -1.5;

        if (distance > DODGE_PEAK && distance < DODGE_START) {
            const t = (DODGE_START - distance) / (DODGE_START - DODGE_PEAK);
            targetDodgeX.current = DODGE_AMOUNT * easeOutQuad(t);
        } else if (distance <= DODGE_PEAK && distance > DODGE_END) {
            const t = (distance - DODGE_END) / (DODGE_PEAK - DODGE_END);
            targetDodgeX.current = DODGE_AMOUNT * easeOutQuad(t);
        } else {
            targetDodgeX.current = 0;
        }

        dodgeX.current = THREE.MathUtils.lerp(dodgeX.current, targetDodgeX.current, 0.08);

        groupRef.current.position.x = position[0] + dodgeX.current;
        groupRef.current.position.y = position[1];

        // === WAVE ===
        if (forearmRef.current) {
            const s = Math.sin(state.clock.elapsedTime * WAVE_SPEED); // -1..1
            const deg = WAVE_MIN + (WAVE_MAX - WAVE_MIN) * (s * 0.5 + 0.5);
            forearmRef.current.rotation.z = THREE.MathUtils.degToRad(deg);
        }
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh renderOrder={1}>
                <planeGeometry args={[SIZE, SIZE]} />
                <meshBasicMaterial
                    map={bodyTex}
                    color="#ffffff"
                    transparent={true}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Forearm + hand, rotating around the elbow */}
            <group ref={forearmRef} position={[PIVOT_X, PIVOT_Y, 0.002]}>
                <mesh position={[-PIVOT_X, -PIVOT_Y, 0]} renderOrder={2}>
                    <planeGeometry args={[SIZE, SIZE]} />
                    <meshBasicMaterial
                        map={forearmTex}
                        color="#ffffff"
                        transparent={true}
                        side={THREE.DoubleSide}
                        depthWrite={false}
                    />
                </mesh>
            </group>
        </group>
    );
};

// Easing function
const easeOutQuad = (t) => t * (2 - t);

export default Avatar;
