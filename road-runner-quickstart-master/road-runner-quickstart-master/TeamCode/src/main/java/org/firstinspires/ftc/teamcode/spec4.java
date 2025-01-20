package org.firstinspires.ftc.teamcode;

import com.acmerobotics.dashboard.config.Config;
import com.acmerobotics.roadrunner.ParallelAction;
import com.acmerobotics.roadrunner.Pose2d;
import com.acmerobotics.roadrunner.Vector2d;
import com.acmerobotics.roadrunner.ftc.Actions;
import com.qualcomm.robotcore.eventloop.opmode.Autonomous;
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.CRServo;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.Servo;


@Autonomous(name = "spec4", group = "Autonomous")
public class spec4 extends LinearOpMode {
    // Debugging flag to enable/disable detailed telemetry
    public static boolean ENABLE_TELEMETRY = true;
    private DcMotor pitch;
    private DcMotor slideMotor;
    private CRServo clawrotation;
    private CRServo claw;
    private CRServo clawPivot;

    // Constants for motor power
    private static final double MOVEMENT_POWER = 1;
    private static final double PITCH_POWER_DOWN = 0.6;
    private static final double IDLE_POWER = 0.1;  // Idle power to maintain position
    private static final double SLIDE_POWER = 0.4;
    private static final double SLIDE_POWER_DOWN = 0.8;

    // Constants for claw positions
    private static final double CLAW_OPEN_POWER = 0.8;
    private static final double CLAW_CLOSE_POWER = -0.8;
    private static final int CLAW_ACTION_TIME_MS = 500;  // Time to open/close claw

    @Override
    public void runOpMode() {
        telemetry.addLine("Initializing Robot...");
        telemetry.update();

        // Set the initial starting position
        Pose2d initialPose = new Pose2d(0, 0, Math.toRadians(90));

        // Initialize Drive
        MecanumDrive drive = new MecanumDrive(hardwareMap, initialPose);

        pitch = hardwareMap.get(DcMotor.class, "high");
        slideMotor = hardwareMap.get(DcMotor.class, "long");
        clawrotation = hardwareMap.get(CRServo.class, "clawrotation");
        claw = hardwareMap.get(CRServo.class, "claw");
        clawPivot = hardwareMap.get(CRServo.class, "clawPivot");

        pitch.setDirection(DcMotor.Direction.FORWARD);
        slideMotor.setDirection(DcMotor.Direction.FORWARD);

        // Configure motors to hold position
        pitch.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        slideMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);

        // Set the claw to fully closed position
        closeClaw();

        telemetry.addLine("Robot Initialized. Waiting for start.");
        telemetry.update();

        waitForStart();

        if (isStopRequested()) return;

        telemetry.addLine("Autonomous Sequence Starting...");
        telemetry.update();

        try {
            movePITCH(pitch,100);
            Actions.runBlocking(
                    drive.actionBuilder(initialPose)
                            .strafeTo(new Vector2d(1, 4))
                            .build()
            );
            movePITCH(pitch, 480);
            moveSLIDE(slideMotor, 850);
            // First Trajectory Segment
            Actions.runBlocking(
                    drive.actionBuilder(drive.pose)
                            .strafeTo(new Vector2d(1, 27))
                            .build()
            );

            moveSLIDEDOWN(slideMotor, -520);
            openClaw();

            Actions.runBlocking(
                    drive.actionBuilder(drive.pose)
                            .strafeTo(new Vector2d(-1, 24))
                            .strafeTo(new Vector2d(-32, 24))
                            .build()
            );

            Actions.runBlocking(
                    drive.actionBuilder(drive.pose)
                            .lineToY(46)
                            .strafeTo(new Vector2d(-39, 46))
                            .build()
            );
            Actions.runBlocking(
                    drive.actionBuilder(drive.pose)
                            .lineToY(12)
                            .lineToY(46)
                            .strafeTo(new Vector2d(-49, 46))
                            .build()
            );
            Actions.runBlocking(
                    drive.actionBuilder(drive.pose)
                            .lineToY(12)
                            .lineToY(46)
                            .strafeTo(new Vector2d(-59, 46))
                            .build()
            );

            Actions.runBlocking(
                    drive.actionBuilder(drive.pose)
                            .lineToY(12)
                            .strafeTo(new Vector2d(-48, 18))
                            .turn(Math.toRadians(187))
                            .build()
            );
            openClaw();
            movePITCHDOWN(pitch,-540);
            sleep(3000);
            closeClaw();

            // Rest of the autonomous sequence remains the same...
            // [Previous autonomous sequence code here]

            telemetry.addLine("Autonomous Sequence Completed Successfully!");
        } catch (Exception e) {
            telemetry.addLine("ERROR in Autonomous Sequence:");
            telemetry.addLine(e.getMessage());
        } finally {
            telemetry.update();
        }
    }

    // Updated helper method to move a motor and maintain position
    private void movePITCH(DcMotor motor, int ticks) {
        motor.setTargetPosition(motor.getCurrentPosition() + ticks);
        motor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        motor.setPower(MOVEMENT_POWER);

        while (motor.isBusy() && opModeIsActive()) {
            idle();
        }

        // Apply idle power to maintain position
        motor.setPower(IDLE_POWER);
    }
    private void movePITCHDOWN(DcMotor motor, int ticks) {
        motor.setTargetPosition(motor.getCurrentPosition() + ticks);
        motor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        motor.setPower(PITCH_POWER_DOWN);

        while (motor.isBusy() && opModeIsActive()) {
            idle();
        }

        // Apply idle power to maintain position
        motor.setPower(IDLE_POWER);
    }
    private void moveSLIDE(DcMotor motor, int ticks) {
        motor.setTargetPosition(motor.getCurrentPosition() + ticks);
        motor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        motor.setPower(SLIDE_POWER);

        while (motor.isBusy() && opModeIsActive()) {
            idle();
        }

        // Apply idle power to maintain position
        motor.setPower(IDLE_POWER);
    }

    // New helper methods for claw control
    public void openClaw() {
        claw.setPower(CLAW_OPEN_POWER);
        sleep(CLAW_ACTION_TIME_MS);  // Give time for the claw to open
        claw.setPower(0.0);  // Stop the servo
    }

    public void closeClaw() {
        claw.setPower(CLAW_CLOSE_POWER);
        sleep(CLAW_ACTION_TIME_MS);  // Give time for the claw to close
        claw.setPower(0.0);  // Stop the servo
    }

    private void moveSLIDEDOWN(DcMotor motor, int ticks) {
        motor.setTargetPosition(motor.getCurrentPosition() + ticks);
        motor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
        motor.setPower(SLIDE_POWER_DOWN);

        while (motor.isBusy() && opModeIsActive()) {
            idle();
        }

        // Apply idle power to maintain position
        motor.setPower(IDLE_POWER);
    }
}