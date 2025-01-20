package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.CRServo;
import com.qualcomm.robotcore.hardware.Servo;
import com.qualcomm.robotcore.util.ElapsedTime;
import com.qualcomm.robotcore.util.Range;

@TeleOp(name="bomboclat", group="Linear Opmode")
public class bomboclat extends LinearOpMode {
    // Original motors
    private DcMotor leftFrontDrive;
    private DcMotor rightFrontDrive;
    private DcMotor leftBackDrive;
    private DcMotor rightBackDrive;
    private DcMotor pitchMotor;
    private DcMotor slideMotor;

    // Add claw servos
    private CRServo clawServo;
    private CRServo clawPivotServo;
    private CRServo clawRotationServo;

    // Claw control variables
    private double clawPower = 0;
    private double clawPivotPower = 0;
    private double clawRotationPower = 0;
    private boolean isClawClosed = true;

    // Claw constants
    private static final double CLAW_OPEN_POWER = 0.5;
    private static final double CLAW_CLOSE_POWER = -0.5;
    private static final double SERVO_INCREMENT = 0.1;

    // Previous button states
    private boolean dpadUpPrev = false;
    private boolean dpadDownPrev = false;
    private boolean dpadLeftPrev = false;
    private boolean dpadRightPrev = false;
    private boolean bButtonPrev = false;

    private static final int PITCH_HOME_POSITION = 0;
    private static final int SLIDES_HOME_POSITION = 0;
    private static final double CLAW_PIVOT_HOME_POWER = 0.0;
    private static final int SLIDES_FULL_OUT = 1590;
    private static final int SLIDES_EXTEND_500 = 1025;
    private static final int PITCH_FULL_OUT = 820;
    private static final int PITCH_EXTEND_900 = 576;


    private static final double SERVO_HOLD_POWER = 0.5;

    private boolean yButtonPrev = false;
    private boolean isPitchUp = false;// Power when holding d-pad
    private static final int PITCH_Y_UP_POSITION = 700;


    private static final double PITCH_POWER = 0.4;
    private static final double SLIDE_POWER = 0.6;
    private static final double DRIVE_POWER = 0.7;


    // Position constants;
    private static final int PITCH_MAX_POSITION = 950;
    private static final int SLIDE_MAX_POSITION = 2200  ;

    private ElapsedTime clawTimer = new ElapsedTime();
    private static final double CLAW_OPERATION_TIME = 0.1; // Time in seconds for claw to open/close


    // Motor state tracking
    private boolean pitchMoving = false;
    private boolean slideMoving = false;
    private final ElapsedTime runtime = new ElapsedTime();

    @Override
    public void runOpMode() {
        initializeHardware();
        waitForStart();
        runtime.reset();

        while (opModeIsActive()) {
            handleButtonControls();
            handleDriveMovement();
            handleClawControl();
            handleManualControls();
            updateTelemetry();
        }
    }

    private void handleButtonControls() {
        // B Button: Toggle claw open/close
        if (gamepad1.b && !bButtonPrev) { // Check if B is pressed and wasn't pressed previously
            isClawClosed = !isClawClosed;  // Toggle the claw state
            clawServo.setPower(isClawClosed ? CLAW_CLOSE_POWER : CLAW_OPEN_POWER); // Set the servo power based on the state
        }
        bButtonPrev = gamepad1.b; // Update the previous state of the B button

        // A Button: Reset pitch, slides, and claw pivot to home position
        if (gamepad1.a) {
            moveSlidesToPosition(SLIDES_HOME_POSITION);
            movePitchToPosition(PITCH_HOME_POSITION);
            clawPivotServo.setPower(CLAW_PIVOT_HOME_POWER);
            clawRotationServo.setPower(0);
        }

        // X Button: Extend slides to 500 and pitch to 900
        if (gamepad1.x) {
            moveSlidesToPosition(SLIDES_EXTEND_500);
            movePitchToPosition(PITCH_EXTEND_900);
        }

        // Y Button: Move pitch up/down and open/close claw based on state
    }



    private void initializeHardware() {
        // Initialize original hardware
        leftFrontDrive = hardwareMap.get(DcMotor.class, "leftFront");
        rightFrontDrive = hardwareMap.get(DcMotor.class, "rightFront");
        leftBackDrive = hardwareMap.get(DcMotor.class, "leftBack");
        rightBackDrive = hardwareMap.get(DcMotor.class, "rightBack");
        pitchMotor = hardwareMap.get(DcMotor.class, "high");
        slideMotor = hardwareMap.get(DcMotor.class, "long");

        // Initialize claw servos
        clawServo = hardwareMap.get(CRServo.class, "claw");
        clawPivotServo = hardwareMap.get(CRServo.class, "clawPivot");
        clawRotationServo = hardwareMap.get(CRServo.class, "clawrotation");

        // Configure motors
        pitchMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        leftFrontDrive.setDirection(DcMotor.Direction.REVERSE);
        leftBackDrive.setDirection(DcMotor.Direction.REVERSE);
        pitchMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        slideMotor.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
        pitchMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        slideMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Start with the claw in the closed position
        clawServo.setPower(CLAW_CLOSE_POWER);
    }


    private void handleClawControl() {
        // Toggle claw open/close with X button
        if (gamepad1.b && !bButtonPrev) {
            if (isClawClosed) {
                clawServo.setPower(CLAW_OPEN_POWER);
                isClawClosed = false;
            } else {
                clawServo.setPower(CLAW_CLOSE_POWER);
                isClawClosed = true;
            }
        }
        bButtonPrev = gamepad1.b;

        // Claw Pivot Control (D-pad up/down)
        if (gamepad1.dpad_up) {
            if (!dpadUpPrev) { // Initial press
                clawPivotPower = Range.clip(clawPivotPower + SERVO_INCREMENT, -1.0, 1.0);
            }
            // Continuous movement while held
            clawPivotServo.setPower(SERVO_HOLD_POWER);
        } else if (gamepad1.dpad_down) {
            if (!dpadDownPrev) { // Initial press
                clawPivotPower = Range.clip(clawPivotPower - SERVO_INCREMENT, -1.0, 1.0);
            }
            // Continuous movement while held
            clawPivotServo.setPower(-SERVO_HOLD_POWER);
        } else {
            clawPivotServo.setPower(clawPivotPower); // Maintain last set position when not pressed
        }
        dpadUpPrev = gamepad1.dpad_up;
        dpadDownPrev = gamepad1.dpad_down;

        // Claw Rotation Control (D-pad left/right)
        if (gamepad1.dpad_left) {
            if (!dpadLeftPrev) { // Initial press
                clawRotationPower = Range.clip(clawRotationPower - SERVO_INCREMENT, -1.0, 1.0);
            }
            // Continuous movement while held
            clawRotationServo.setPower(-SERVO_HOLD_POWER);
        } else if (gamepad1.dpad_right) {
            if (!dpadRightPrev) { // Initial press
                clawRotationPower = Range.clip(clawRotationPower + SERVO_INCREMENT, -1.0, 1.0);
            }
            // Continuous movement while held
            clawRotationServo.setPower(SERVO_HOLD_POWER);
        } else {
            clawRotationServo.setPower(clawRotationPower); // Maintain last set position when not pressed
        }
        dpadLeftPrev = gamepad1.dpad_left;
        dpadRightPrev = gamepad1.dpad_right;
    }


    private void handleManualControls() {
        double pitchInput = gamepad1.right_trigger - gamepad1.left_trigger;

        // Pitch control with deadzone and power optimization
        if (Math.abs(pitchInput) > 0.1) {
            pitchMoving = true;
            pitchMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

            // Apply power with position limits
            double pitchPower = 0;
            if ((pitchMotor.getCurrentPosition() < PITCH_MAX_POSITION || pitchInput < 0) &&
                    (pitchMotor.getCurrentPosition() > 0 || pitchInput > 0)) {
                pitchPower = pitchInput * PITCH_POWER;
            }

            pitchMotor.setPower(pitchPower);
        } else if (pitchMoving) {
            pitchMotor.setPower(0);
            pitchMoving = false;
            // Hold position when manual control ends
            movePitchToPosition(pitchMotor.getCurrentPosition());
        }

        // Slide control with optimized power
        if (gamepad1.right_bumper || gamepad1.left_bumper) {
            slideMoving = true;
            slideMotor.setMode(DcMotor.RunMode.RUN_USING_ENCODER);

            double slidePower = 0;
            if (gamepad1.right_bumper && slideMotor.getCurrentPosition() < SLIDE_MAX_POSITION) {
                slidePower = SLIDE_POWER;
            } else if (gamepad1.left_bumper && slideMotor.getCurrentPosition() > 0) {
                slidePower = -SLIDE_POWER;
            }

            slideMotor.setPower(slidePower);
        } else if (slideMoving) {
            slideMotor.setPower(0);
            slideMoving = false;
            // Hold position when manual control ends
            moveSlidesToPosition(slideMotor.getCurrentPosition());
        }
    }


    private void handleDriveMovement() {
        double drive = -gamepad1.left_stick_y;
        double strafe = gamepad1.left_stick_x;
        double turn = gamepad1.right_stick_x;

        // Only calculate and apply power if there's significant input
        if (Math.abs(drive) > 0.1 || Math.abs(strafe) > 0.1 || Math.abs(turn) > 0.1) {
            // Calculate wheel powers
            double[] powers = new double[4];
            powers[0] = drive + strafe + turn;  // Left Front
            powers[1] = drive - strafe - turn;  // Right Front
            powers[2] = drive - strafe + turn;  // Left Back
            powers[3] = drive + strafe - turn;  // Right Back

            // Normalize powers
            double max = Math.abs(powers[0]);
            for (int i = 1; i < 4; i++) {
                max = Math.max(max, Math.abs(powers[i]));
            }
            if (max > 1.0) {
                for (int i = 0; i < 4; i++) {
                    powers[i] /= max;
                }
            }

            // Apply powers
            leftFrontDrive.setPower(powers[0] * DRIVE_POWER);
            rightFrontDrive.setPower(powers[1] * DRIVE_POWER);
            leftBackDrive.setPower(powers[2] * DRIVE_POWER);
            rightBackDrive.setPower(powers[3] * DRIVE_POWER);
        } else {
            // Stop motors if no significant input
            leftFrontDrive.setPower(0);
            rightFrontDrive.setPower(0);
            leftBackDrive.setPower(0);
            rightBackDrive.setPower(0);
        }
    }

    // Simplified movement methods
    private void movePitchToPosition(int targetPosition) {
        // Add hard stop check
        if (targetPosition > PITCH_MAX_POSITION) {
            targetPosition = PITCH_MAX_POSITION;
        } else if (targetPosition < 0) {
            targetPosition = 0;
        }

        pitchMotor.setTargetPosition(targetPosition);
        pitchMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        pitchMotor.setPower(PITCH_POWER);
    }

    private void moveSlidesToPosition(int targetPosition) {
        targetPosition = Range.clip(targetPosition, 0, SLIDE_MAX_POSITION);
        slideMotor.setTargetPosition(targetPosition);
        slideMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        slideMotor.setPower(SLIDE_POWER);
    }


    private void resetPositions() {
        movePitchToPosition(0);
        moveSlidesToPosition(0);
    }

    private void updateTelemetry() {
        telemetry.addData("Status", "Run Time: " + runtime.toString());
        telemetry.addData("Claw Power", "%.2f", clawPower);
        telemetry.addData("Claw Pivot Power", "%.2f", clawPivotPower);
        telemetry.addData("Claw Rotation Power", "%.2f", clawRotationPower);
        telemetry.addData("Pitch Position", pitchMotor.getCurrentPosition());
        telemetry.addData("Pitch Target", pitchMotor.getTargetPosition());
        telemetry.addData("Pitch Power", pitchMotor.getPower());
        telemetry.addData("Slide Position", slideMotor.getCurrentPosition());
        telemetry.addData("Slide Target", slideMotor.getTargetPosition());
        telemetry.addData("Slide Power", slideMotor.getPower());
        telemetry.addData("Claw State", isClawClosed ? "Closed" : "Open");
        telemetry.update();
    }
}