package org.firstinspires.ftc.teamcode;

import android.annotation.SuppressLint;

import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
import com.qualcomm.robotcore.eventloop.opmode.OpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import com.qualcomm.robotcore.hardware.Gamepad;
import com.qualcomm.robotcore.hardware.HardwareMap;
import com.qualcomm.robotcore.hardware.IMU;
import com.qualcomm.robotcore.hardware.Servo;

import org.firstinspires.ftc.robotcore.external.Telemetry;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;

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
@TeleOp(name="SimplifiedTeleop")
public class SimplifiedTeleop extends OpMode {
    // Main robot subsystems
    private rd drivetrain;
    private ls liftSystem;
    private gs gripperSystem;

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
        drivetrain = new rd(hardwareMap);
        liftSystem = new ls(hardwareMap);
        gripperSystem = new gs(hardwareMap);
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
        liftSystem.handleLiftInput(gamepad1.left_trigger, gamepad1.right_trigger);
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
class rd {
    private DcMotorEx frontLeft, frontRight, backLeft, backRight;
    private IMU imu;

    // Drive constants
    private static final double DEADZONE = 0.05;     // Minimum joystick input to register
    private static final double BASE_SPEED = 0.9;    // 90% speed
    private static final double RAMP_RATE = 0.15;    // Maximum power change per cycle

    // Current motor power values for ramping
    private final double[] currentPowers = new double[4];
    private double[] targetPowers = new double[4];

    public rd(HardwareMap hardwareMap) {
        initializeMotors(hardwareMap);
        initializeIMU(hardwareMap);
    }

    private void initializeMotors(HardwareMap hardwareMap) {
        // Get motor references from hardware map
        frontLeft = hardwareMap.get(DcMotorEx.class, "leftFront");
        frontRight = hardwareMap.get(DcMotorEx.class, "rightFront");
        backLeft = hardwareMap.get(DcMotorEx.class, "leftBack");
        backRight = hardwareMap.get(DcMotorEx.class, "rightBack");

        // Set motor directions
        frontLeft.setDirection(DcMotorEx.Direction.REVERSE);
        frontRight.setDirection(DcMotorEx.Direction.FORWARD);
        backLeft.setDirection(DcMotorEx.Direction.REVERSE);
        backRight.setDirection(DcMotorEx.Direction.FORWARD);

        // Configure all motors
        DcMotorEx[] motors = {frontLeft, frontRight, backLeft, backRight};
        for (DcMotorEx motor : motors) {
            motor.setZeroPowerBehavior(DcMotorEx.ZeroPowerBehavior.BRAKE);
            motor.setMode(DcMotorEx.RunMode.RUN_WITHOUT_ENCODER);
        }
    }

    private void initializeIMU(HardwareMap hardwareMap) {
        imu = hardwareMap.get(IMU.class, "imu");
        IMU.Parameters parameters = new IMU.Parameters(
                new RevHubOrientationOnRobot(
                        RevHubOrientationOnRobot.LogoFacingDirection.UP,
                        RevHubOrientationOnRobot.UsbFacingDirection.FORWARD
                )
        );
        imu.initialize(parameters);
    }

    private double processJoystickInput(double input) {
        if (Math.abs(input) < DEADZONE) {
            return 0;
        }
        return input;  // Simplified response curve for clearer behavior
    }

    private double rampPower(double current, double target) {
        double difference = target - current;
        if (Math.abs(difference) <= RAMP_RATE) {
            return target;
        }
        return current + Math.signum(difference) * RAMP_RATE;
    }

    private void applyPowerRamping() {
        for (int i = 0; i < 4; i++) {
            currentPowers[i] = rampPower(currentPowers[i], targetPowers[i]);
        }

        // Apply the ramped powers to motors
        frontLeft.setPower(currentPowers[0]);
        frontRight.setPower(currentPowers[1]);
        backLeft.setPower(currentPowers[2]);
        backRight.setPower(currentPowers[3]);
    }

    public void handleDriveInput(Gamepad gamepad) {
        // Get raw inputs
        double drive = -processJoystickInput(gamepad.left_stick_y);    // Forward/Backward
        double strafe = processJoystickInput(gamepad.left_stick_x);    // Left/Right
        double turn = processJoystickInput(gamepad.right_stick_x) * 0.7;  // Rotation

        // Get the robot's heading
        double robotHeading = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.RADIANS);

        // Convert to field-centric drive commands
        double rotX = strafe * Math.cos(robotHeading) + drive * Math.sin(robotHeading);
        double rotY = -strafe * Math.sin(robotHeading) + drive * Math.cos(robotHeading);

        // Calculate target powers for mecanum drive
        targetPowers = calculateMecanumPowers(rotY, rotX, turn);

        // Apply power ramping
        applyPowerRamping();
    }

    private double[] calculateMecanumPowers(double drive, double strafe, double turn) {
        double[] powers = new double[4];

        // Calculate raw power values for mecanum drive
        powers[0] = drive + strafe + turn;     // Front Left
        powers[1] = drive - strafe - turn;     // Front Right
        powers[2] = drive - strafe + turn;     // Back Left
        powers[3] = drive + strafe - turn;     // Back Right

        // Normalize powers
        double maxPower = Math.max(1.0,
                Math.max(Math.abs(powers[0]),
                        Math.max(Math.abs(powers[1]),
                                Math.max(Math.abs(powers[2]), Math.abs(powers[3])))));

        // Apply normalization and speed multiplier
        for (int i = 0; i < powers.length; i++) {
            powers[i] = (powers[i] / maxPower) * rd.BASE_SPEED;
        }

        return powers;
    }

    @SuppressLint("DefaultLocale")
    public void addTelemetry(Telemetry telemetry) {
        telemetry.addData("Drive Motors",
                String.format("FL:%.2f FR:%.2f BL:%.2f BR:%.2f",
                        currentPowers[0], currentPowers[1],
                        currentPowers[2], currentPowers[3]));
        telemetry.addData("Robot Heading", "%.2f deg",
                Math.toDegrees(imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.RADIANS)));
    }
}
/**
 * Manages the lift system with direct power control
 */
class ls {
    private DcMotorEx liftMotor;
    private static final double LIFT_POWER_SCALE = 0.7;  // Maximum lift power
    private static final double LIFT_DEAD_ZONE = 0.1;    // Minimum trigger input

    public ls(HardwareMap hardwareMap) {
        initializeLiftMotor(hardwareMap);
    }

    /**
     * Initialize and configure the lift motor
     */
    private void initializeLiftMotor(HardwareMap hardwareMap) {
        liftMotor = hardwareMap.get(DcMotorEx.class, "lift");
        liftMotor.setMode(DcMotorEx.RunMode.STOP_AND_RESET_ENCODER);
        liftMotor.setMode(DcMotorEx.RunMode.RUN_WITHOUT_ENCODER);
        liftMotor.setZeroPowerBehavior(DcMotorEx.ZeroPowerBehavior.BRAKE);
    }

    /**
     * Handle lift control using triggers
     * Right trigger: Up
     * Left trigger: Down
     */
    public void handleLiftInput(double upTrigger, double downTrigger) {
        double liftPower = 0;

        if (upTrigger > LIFT_DEAD_ZONE) {
            liftPower = processLiftInput(upTrigger);
        } else if (downTrigger > LIFT_DEAD_ZONE) {
            liftPower = -processLiftInput(downTrigger);
        }

        liftMotor.setPower(liftPower * LIFT_POWER_SCALE);
    }

    /**
     * Process lift input for smoother control
     */
    private double processLiftInput(double input) {
        return Math.pow(input, 2);
    }

    public void addTelemetry(Telemetry telemetry) {
        telemetry.addData("Lift Power", "%.2f", liftMotor.getPower());
        telemetry.addData("Lift Position", liftMotor.getCurrentPosition());
    }
}

/**
 * Manages the gripper system with open/close functionality
 */
class gs {
    private Servo gripper;
    private boolean isGripperClosed = false;
    private double lastKnownGoodPosition;

    // Gripper position constants
    private static final double GRIPPER_OPEN_POSITION = 1.0;
    private static final double GRIPPER_CLOSED_POSITION = 0.0;
    private static final double GRIPPER_VERTICAL_POSITION = 0.5;
    private static final double POSITION_TOLERANCE = 0.05;

    public gs(HardwareMap hardwareMap) {
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