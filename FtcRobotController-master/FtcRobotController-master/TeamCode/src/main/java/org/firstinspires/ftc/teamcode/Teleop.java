package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.OpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import com.qualcomm.robotcore.hardware.DcMotorSimple;
import com.qualcomm.robotcore.hardware.Gamepad;
import com.qualcomm.robotcore.hardware.HardwareMap;
import com.qualcomm.robotcore.hardware.Servo;
import com.qualcomm.robotcore.util.ElapsedTime;

import org.firstinspires.ftc.robotcore.external.Telemetry;

/**
 * Simplified TeleOp Implementation for FTC Robot Control
 *
 * Features:
 * - Field-centric mecanum drive with custom response curve and power ramping
 * - Position-controlled lift system
 * - Simple gripper control (open/close)
 *
 * Control Mapping:
 * Gamepad 1:
 * - Left stick Y: Forward/Backward
 * - Left stick X: Left/Right strafe
 * - Right stick X: Rotation
 * - Triggers: Lift control (up/down)
 * - A: Close gripper
 * - B: Open gripper
 * - X: Set gripper to vertical position
 */
@TeleOp(name="teleop")
public class Teleop extends OpMode {
    // Main robot subsystems
    private rdd drivetrain;
    private lss liftSystem;
    private gss gripperSystem;

    @Override
    public void init() {
        initializeRobotSystems();
        telemetry.addData("Status", "Initialized");
        telemetry.update();
    }

    /**
     * Initialize all robot subsystems with hardware mappings
     */
    private void initializeRobotSystems() {
        drivetrain = new rdd(hardwareMap);
        liftSystem = new lss(hardwareMap);
        gripperSystem = new gss(hardwareMap);
    }

    @Override
    public void loop() {
        updateDrivetrain();
        updateLiftSystem();
        updateGripperSystem();
        updateTelemetry();
    }

    private void updateDrivetrain() {
        drivetrain.handleDriveInput(gamepad1);
    }

    private void updateLiftSystem() {
        liftSystem.handleLiftInput(gamepad1);
    }

    private void updateGripperSystem() {
        gripperSystem.handleInput(gamepad1);
    }

    private void updateTelemetry() {
        drivetrain.addTelemetry(telemetry);
        liftSystem.addTelemetry(telemetry);
        gripperSystem.addTelemetry(telemetry);
        telemetry.update();
    }
}

/**
 * Manages the robot's mecanum drivetrain with field-centric control
 */
class rdd {
    private DcMotorEx frontLeft, frontRight, backLeft, backRight;

    // Drive constants
    private static final double DEADZONE = 0.05;
    private static final double BASE_SPEED = 0.8;      // Slightly reduced base speed for smoothness
    private static final double RAMP_RATE = 0.1;       // Reduced ramp rate for smoother transitions
    private static final double TURN_SENSITIVITY = 0.5; // Reduced turn multiplier for smoother turns

    private final double[] currentPowers = new double[4];
    private double[] targetPowers = new double[4];

    public rdd(HardwareMap hardwareMap) {
        initializeMotors(hardwareMap);
    }

    private void initializeMotors(HardwareMap hardwareMap) {
        frontLeft = hardwareMap.get(DcMotorEx.class, "leftFront");
        frontRight = hardwareMap.get(DcMotorEx.class, "rightFront");
        backLeft = hardwareMap.get(DcMotorEx.class, "leftBack");
        backRight = hardwareMap.get(DcMotorEx.class, "rightBack");

        frontLeft.setDirection(DcMotorEx.Direction.FORWARD);
        frontRight.setDirection(DcMotorEx.Direction.FORWARD);
        backLeft.setDirection(DcMotorEx.Direction.REVERSE);
        backRight.setDirection(DcMotorEx.Direction.FORWARD);

        DcMotorEx[] motors = {frontLeft, frontRight, backLeft, backRight};
        for (DcMotorEx motor : motors) {
            motor.setZeroPowerBehavior(DcMotorEx.ZeroPowerBehavior.BRAKE);
            motor.setMode(DcMotorEx.RunMode.RUN_WITHOUT_ENCODER);
        }
    }

    private double processJoystickInput(double input) {
        return Math.abs(input) < DEADZONE ? 0 : input;
    }

    private double rampPower(double current, double target) {
        double difference = target - current;
        return Math.abs(difference) <= RAMP_RATE ? target : current + Math.signum(difference) * RAMP_RATE;
    }

    private void applyPowerRamping() {
        for (int i = 0; i < 4; i++) {
            currentPowers[i] = rampPower(currentPowers[i], targetPowers[i]);
        }

        frontLeft.setPower(currentPowers[0]);
        frontRight.setPower(currentPowers[1]);
        backLeft.setPower(currentPowers[2]);
        backRight.setPower(currentPowers[3]);
    }

    public void handleDriveInput(Gamepad gamepad) {
        double drive = -processJoystickInput(gamepad.left_stick_y);
        double strafe = processJoystickInput(gamepad.left_stick_x);
        double turn = processJoystickInput(gamepad.right_stick_x) * TURN_SENSITIVITY;

        targetPowers = calculateMecanumPowers(drive, strafe, turn);
        applyPowerRamping();
    }

    private double[] calculateMecanumPowers(double drive, double strafe, double turn) {
        double[] powers = new double[4];

        powers[0] = drive + strafe + turn;
        powers[1] = drive - strafe - turn;
        powers[2] = drive - strafe + turn;
        powers[3] = drive + strafe - turn;

        double maxPower = Math.max(1.0, Math.max(Math.abs(powers[0]), Math.max(Math.abs(powers[1]), Math.max(Math.abs(powers[2]), Math.abs(powers[3])))));

        for (int i = 0; i < powers.length; i++) {
            powers[i] = (powers[i] / maxPower) * BASE_SPEED;
        }

        return powers;
    }

    public void addTelemetry(Telemetry telemetry) {
        telemetry.addData("Drive Motors", String.format("FL:%.2f FR:%.2f BL:%.2f BR:%.2f", currentPowers[0], currentPowers[1], currentPowers[2], currentPowers[3]));
    }
}

/**
 * Manages the lift system with direct power control
 */

class lss {
    private DcMotorEx liftMotor;
    private static final double LIFT_POWER_SCALE = 0.7;  // Maximum lift power for manual control
    private static final double LIFT_DEAD_ZONE = 0.1;    // Minimum trigger input to activate lift

    public lss(HardwareMap hardwareMap) {
        initializeLiftMotor(hardwareMap);
    }

    private void initializeLiftMotor(HardwareMap hardwareMap) {
        liftMotor = hardwareMap.get(DcMotorEx.class, "lift");
        liftMotor.setZeroPowerBehavior(DcMotorEx.ZeroPowerBehavior.BRAKE);
    }

    /**
     * Handle lift control using triggers for manual up/down control.
     * - Right trigger: Lift moves up
     * - Left trigger: Lift moves down
     */
    public void handleLiftInput(Gamepad gamepad) {
        double liftPower = 0;

        // Apply power based on trigger inputs
        if (gamepad.right_trigger > LIFT_DEAD_ZONE) {
            liftPower = processLiftInput(gamepad.right_trigger);  // Move up
        } else if (gamepad.left_trigger > LIFT_DEAD_ZONE) {
            liftPower = -processLiftInput(gamepad.left_trigger);  // Move down
        }

        liftMotor.setPower(liftPower * LIFT_POWER_SCALE);
    }

    /**
     * Process lift input for smoother control.
     */
    private double processLiftInput(double input) {
        return Math.pow(input, 2);  // Apply a square curve for finer control at low trigger values
    }

    public void addTelemetry(Telemetry telemetry) {
        telemetry.addData("Lift Power", "%.2f", liftMotor.getPower());
    }
}



/**
 * Manages the gripper system with open/close functionality
 */
class gss {
    private Servo gripper;
    private boolean isGripperClosed = false;
    private double lastKnownGoodPosition;

    // Gripper position constants
    private static final double GRIPPER_OPEN_POSITION = 1.0;
    private static final double GRIPPER_CLOSED_POSITION = 0.0;
    private static final double GRIPPER_VERTICAL_POSITION = 0.5;
    private static final double POSITION_TOLERANCE = 0.05;

    public gss(HardwareMap hardwareMap) {
        initializeGripperSystem(hardwareMap);
    }

    /**
     * Initialize and configure the gripper servo
     */
    private void initializeGripperSystem(HardwareMap hardwareMap) {
        gripper = hardwareMap.get(Servo.class, "gripper");

        // Set initial position
        gripper.setPosition(GRIPPER_VERTICAL_POSITION);
        lastKnownGoodPosition = GRIPPER_VERTICAL_POSITION;

        // Allow servo time to reach position
        try {
            Thread.sleep(250);
        } catch (InterruptedException e) {
            // Ignore interruption
        }
    }

    /**
     * Handle gripper control based on gamepad input
     * A: Close gripper
     * B: Open gripper
     * X: Set to vertical position
     */
    public void handleInput(Gamepad gamepad) {
        double targetPosition = gripper.getPosition();

        if (gamepad.x) {
            targetPosition = GRIPPER_VERTICAL_POSITION;
        } else if (gamepad.a && !isGripperClosed) {
            targetPosition = GRIPPER_CLOSED_POSITION;
            isGripperClosed = true;
        } else if (gamepad.b && isGripperClosed) {
            targetPosition = GRIPPER_OPEN_POSITION;
            isGripperClosed = false;
        }

        if (Math.abs(targetPosition - gripper.getPosition()) > POSITION_TOLERANCE) {
            gripper.setPosition(targetPosition);
            lastKnownGoodPosition = targetPosition;
        }
    }

    public void addTelemetry(Telemetry telemetry) {
        telemetry.addData("Gripper State", isGripperClosed ? "Closed" : "Open");
    }
}